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

EXTRACTION_PROMPT = """You are a professional resume/job description parsing assistant. Extract structured information from the following text.

**Important rules**:
1. Only extract information that is explicitly present in the text; do not fabricate or speculate
2. If certain information is not present, return an empty array []
3. Skill names must match the original text or be normalized expressions of it
4. Output must be valid JSON only; do not include any other text

Text:
---
{text}
---

Output JSON in the following format:
{{
  "skills": ["skill1", "skill2"],
  "experience": [{{"company": "company name", "role": "job title", "duration": "duration"}}],
  "education": [{{"school": "school name", "degree": "degree", "year": "year"}}],
  "responsibilities": ["responsibility 1", "responsibility 2"]
}}"""

MATCH_PROMPT = """You are a professional resume-job matching analyst. Based on the following resume and job description, perform a matching analysis.

**Important rules**:
1. Match score must be based on skills and experience explicitly present in both resume and JD; do not fabricate
2. Each item in matched_skills must have corresponding content in the original resume text
3. Each item in skill_gaps must be a requirement in the JD that is not reflected in the resume
4. improvement_suggestions must be specific, actionable, and related to the skill gaps
5. Output must be valid JSON

**Resume parsing result**:
{resume}

**Job description parsing result**:
{jd}

Output JSON:
{{
  "match_percentage": integer 0-100,
  "matched_skills": ["matched skill 1", "matched skill 2"],
  "skill_gaps": ["missing skill 1", "missing skill 2"],
  "improvement_suggestions": ["specific improvement 1", "specific improvement 2"]
}}"""

CAREER_PROMPT = """You are a professional career development advisor. Based on the following resume parsing result, provide career advice.

**Important rules**:
1. Suggestions must be based on information already in the resume; you may quote appropriately
2. Do not fabricate experience or skills not present in the resume
3. Output must be valid JSON

**Resume parsing result**:
{resume}

**Target role**: {target_role}

Output JSON:
{{
  "resume_tips": ["resume improvement tip 1", "resume improvement tip 2"],
  "skill_roadmap": [{{"skill": "skill name", "priority": "high/medium/low", "reason": "reason"}}],
  "learning_suggestions": ["learning suggestion 1", "learning suggestion 2"]
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
    target_role = target_role or "career advancement roles relevant to current experience"

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
