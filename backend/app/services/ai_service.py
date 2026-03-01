import json
import re
from typing import Optional

from openai import OpenAI

from app.core.config import settings

EXTRACTION_SCHEMA = {
    "skills": ["string"],
    "experience": [{"company": "string", "role": "string", "duration": "string"}],
    "education": [{"school": "string", "degree": "string", "year": "string"}],
    "responsibilities": ["string"],
}

EXTRACTION_PROMPT = """你是一个专业的简历/职位描述解析助手。请从以下文本中提取结构化信息。

**重要规则**：
1. 仅提取文本中明确存在的信息，不要编造或推测
2. 如某项信息不存在，返回空数组 []
3. 技能名称必须与原文一致或为原文的规范化表达
4. 输出必须是合法的 JSON，不要包含其他文字

文本：
---
{text}
---

请输出 JSON，格式如下：
{{
  "skills": ["技能1", "技能2"],
  "experience": [{{"company": "公司名", "role": "职位", "duration": "时长"}}],
  "education": [{{"school": "学校", "degree": "学位", "year": "年份"}}],
  "responsibilities": ["职责描述1", "职责描述2"]
}}"""

MATCH_PROMPT = """你是一个专业的简历-职位匹配分析助手。基于以下简历和职位描述，进行匹配分析。

**重要规则**：
1. 匹配分数必须基于简历与JD中明确存在的技能和经历，不得虚构
2. matched_skills 中的每一项必须能在简历原文中找到对应内容
3. skill_gaps 中的每一项必须能在JD原文中找到要求但简历未体现
4. improvement_suggestions 必须具体可操作，且与技能差距相关
5. 输出必须是合法的 JSON

**简历解析结果**：
{resume}

**职位描述解析结果**：
{jd}

请输出 JSON：
{{
  "match_percentage": 0-100 的整数,
  "matched_skills": ["已匹配技能1", "已匹配技能2"],
  "skill_gaps": ["缺失技能1", "缺失技能2"],
  "improvement_suggestions": ["具体改进建议1", "具体改进建议2"]
}}"""

CAREER_PROMPT = """你是一个专业的职业发展顾问。基于以下简历解析结果，给出职业建议。

**重要规则**：
1. 建议必须基于简历中已有的信息，可适当引用
2. 不要虚构简历中不存在的经历或技能
3. 输出必须是合法的 JSON

**简历解析结果**：
{resume}

**目标岗位**：{target_role}

请输出 JSON：
{{
  "resume_tips": ["简历改进建议1", "简历改进建议2"],
  "skill_roadmap": [{{"skill": "技能名", "priority": "高/中/低", "reason": "原因"}}],
  "learning_suggestions": ["学习建议1", "学习建议2"]
}}"""


def _get_client() -> Optional[OpenAI]:
    if settings.OPENROUTER_API_KEY:
        return OpenAI(
            base_url=settings.AI_BASE_URL,
            api_key=settings.OPENROUTER_API_KEY,
        )
    if settings.OPENAI_API_KEY:
        return OpenAI(api_key=settings.OPENAI_API_KEY)
    return None


def _extract_json_from_response(text: str) -> Optional[dict]:
    """从模型响应中提取 JSON，支持被 markdown 代码块包裹的情况"""
    text = text.strip()
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        return None


def _validate_skills_in_text(skills: list, text: str) -> list:
    """简单校验：技能是否在原文中出现过（子串匹配），过滤可能幻觉"""
    if not text:
        return skills
    text_lower = text.lower()
    result = []
    for s in skills:
        if isinstance(s, str) and s.lower() in text_lower:
            result.append(s)
        elif isinstance(s, str):
            # 允许规范化技能名，如 "Python" 对应 "Python 编程"
            words = s.split()
            if any(w.lower() in text_lower for w in words if len(w) > 2):
                result.append(s)
        else:
            result.append(str(s))
    return result[:20]  # 限制数量


def parse_resume_or_jd(raw_text: str, doc_type: str = "resume") -> dict:
    """使用 AI 解析简历或 JD，提取结构化信息（支持 OpenRouter / OpenAI）"""
    client = _get_client()
    if not client:
        return {"skills": [], "experience": [], "education": [], "responsibilities": []}

    prompt = EXTRACTION_PROMPT.format(text=raw_text[:12000])
    try:
        response = client.chat.completions.create(
            model=settings.effective_ai_model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        content = response.choices[0].message.content
        data = _extract_json_from_response(content) if content else None
        if not data:
            return {"skills": [], "experience": [], "education": [], "responsibilities": []}

        skills = data.get("skills", [])
        if isinstance(skills, list):
            skills = _validate_skills_in_text(skills, raw_text)
        else:
            skills = []

        return {
            "skills": skills,
            "experience": data.get("experience", []) if isinstance(data.get("experience"), list) else [],
            "education": data.get("education", []) if isinstance(data.get("education"), list) else [],
            "responsibilities": data.get("responsibilities", []) if isinstance(data.get("responsibilities"), list) else [],
        }
    except Exception:
        return {"skills": [], "experience": [], "education": [], "responsibilities": []}


def match_resume_to_jd(
    resume_extraction: dict,
    jd_extraction: dict,
) -> dict:
    """简历与 JD 匹配，返回匹配分数、已匹配技能、技能差距、改进建议"""
    client = _get_client()
    if not client:
        return {
            "match_percentage": 0,
            "matched_skills": [],
            "skill_gaps": [],
            "improvement_suggestions": [],
        }

    resume_str = json.dumps(resume_extraction, ensure_ascii=False, indent=2)
    jd_str = json.dumps(jd_extraction, ensure_ascii=False, indent=2)

    prompt = MATCH_PROMPT.format(resume=resume_str, jd=jd_str)
    try:
        response = client.chat.completions.create(
            model=settings.effective_ai_model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.2,
        )
        content = response.choices[0].message.content
        data = _extract_json_from_response(content) if content else None
        if not data:
            return {
                "match_percentage": 0,
                "matched_skills": [],
                "skill_gaps": [],
                "improvement_suggestions": [],
            }

        return {
            "match_percentage": min(100, max(0, int(data.get("match_percentage", 0)))),
            "matched_skills": data.get("matched_skills", []) if isinstance(data.get("matched_skills"), list) else [],
            "skill_gaps": data.get("skill_gaps", []) if isinstance(data.get("skill_gaps"), list) else [],
            "improvement_suggestions": data.get("improvement_suggestions", []) if isinstance(data.get("improvement_suggestions"), list) else [],
        }
    except Exception:
        return {
            "match_percentage": 0,
            "matched_skills": [],
            "skill_gaps": [],
            "improvement_suggestions": [],
        }


def get_career_advice(resume_extraction: dict, target_role: str = "") -> dict:
    """基于简历解析结果生成职业建议"""
    client = _get_client()
    if not client:
        return {
            "resume_tips": [],
            "skill_roadmap": [],
            "learning_suggestions": [],
        }

    resume_str = json.dumps(resume_extraction, ensure_ascii=False, indent=2)
    target_role = target_role or "与当前经历相关的进阶岗位"

    prompt = CAREER_PROMPT.format(resume=resume_str, target_role=target_role)
    try:
        response = client.chat.completions.create(
            model=settings.effective_ai_model,
            messages=[{"role": "user", "content": prompt}],
            response_format={"type": "json_object"},
            temperature=0.3,
        )
        content = response.choices[0].message.content
        data = _extract_json_from_response(content) if content else None
        if not data:
            return {"resume_tips": [], "skill_roadmap": [], "learning_suggestions": []}

        return {
            "resume_tips": data.get("resume_tips", []) if isinstance(data.get("resume_tips"), list) else [],
            "skill_roadmap": data.get("skill_roadmap", []) if isinstance(data.get("skill_roadmap"), list) else [],
            "learning_suggestions": data.get("learning_suggestions", []) if isinstance(data.get("learning_suggestions"), list) else [],
        }
    except Exception:
        return {"resume_tips": [], "skill_roadmap": [], "learning_suggestions": []}
