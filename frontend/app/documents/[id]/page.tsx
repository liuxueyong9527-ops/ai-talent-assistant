"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface DocumentDetail {
  id: number;
  type: string;
  original_filename: string;
  raw_text?: string;
  extraction?: {
    skills: string[];
    experience: unknown[];
    education: unknown[];
    responsibilities: string[];
  };
  created_at: string;
}

interface CareerAdvice {
  resume_tips: string[];
  skill_roadmap: { skill: string; priority: string; reason: string }[];
  learning_suggestions: string[];
}

export default function DocumentDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const [targetRole, setTargetRole] = useState("");
  const [careerData, setCareerData] = useState<CareerAdvice | null>(null);
  const [careerLoading, setCareerLoading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["document", id],
    queryFn: () => apiFetch<DocumentDetail>(`/api/documents/${id}`),
    enabled: !!id,
  });

  const fetchCareerAdvice = async () => {
    setCareerLoading(true);
    setCareerData(null);
    try {
      const res = await apiFetch<CareerAdvice>("/api/career/advice", {
        method: "POST",
        body: JSON.stringify({ document_id: Number(id), target_role: targetRole || undefined }),
      });
      setCareerData(res);
    } catch {
      setCareerData({ resume_tips: [], skill_roadmap: [], learning_suggestions: [] });
    } finally {
      setCareerLoading(false);
    }
  };

  if (isLoading || !data) {
    return <div className="text-gray-500">加载中...</div>;
  }

  const exp = data.extraction?.experience as { company?: string; role?: string; duration?: string }[] | undefined;
  const edu = data.extraction?.education as { school?: string; degree?: string; year?: string }[] | undefined;

  return (
    <div>
      <Link href="/documents" className="text-blue-600 hover:underline mb-4 inline-block">
        返回文档列表
      </Link>
      <h1 className="text-2xl font-bold mb-2">{data.original_filename}</h1>
      <p className="text-sm text-gray-500 mb-6">
        {data.type === "resume" ? "简历" : "职位描述"} · {data.created_at}
      </p>

      {data.extraction && data.extraction.skills?.length > 0 && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">技能</h2>
          <div className="flex flex-wrap gap-2">
            {data.extraction.skills.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-full text-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {exp && exp.length > 0 && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">工作经历</h2>
          <ul className="space-y-2">
            {exp.map((e, i) => (
              <li key={i} className="border-l-2 border-blue-500 pl-4">
                <span className="font-medium">{e.role || "职位"}</span>
                <span className="text-gray-500"> @ {e.company || "公司"}</span>
                {e.duration && <span className="text-sm text-gray-400"> · {e.duration}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {edu && edu.length > 0 && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">教育背景</h2>
          <ul className="space-y-2">
            {edu.map((e, i) => (
              <li key={i}>
                {e.degree || "学位"} · {e.school || "学校"}
                {e.year && <span className="text-gray-500"> ({e.year})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.type === "resume" && (
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">AI 职业建议</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="目标岗位（可选）"
              className="flex-1 px-3 py-2 border rounded-lg"
            />
            <button
              onClick={fetchCareerAdvice}
              disabled={careerLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {careerLoading ? "生成中..." : "获取建议"}
            </button>
          </div>
          {careerData && (
            <div className="mt-4 space-y-4">
              {careerData.resume_tips?.length > 0 && (
                <div>
                  <h3 className="font-medium text-green-700 dark:text-green-400">简历改进</h3>
                  <ul className="list-disc list-inside mt-1">
                    {careerData.resume_tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {careerData.skill_roadmap?.length > 0 && (
                <div>
                  <h3 className="font-medium text-blue-700 dark:text-blue-400">技能路线图</h3>
                  <ul className="mt-1 space-y-1">
                    {careerData.skill_roadmap.map((r, i) => (
                      <li key={i}>
                        <span className="font-medium">{r.skill}</span>
                        <span className="text-gray-500"> ({r.priority})</span>
                        {r.reason && <span className="text-sm text-gray-400"> - {r.reason}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {careerData.learning_suggestions?.length > 0 && (
                <div>
                  <h3 className="font-medium text-purple-700 dark:text-purple-400">学习建议</h3>
                  <ul className="list-disc list-inside mt-1">
                    {careerData.learning_suggestions.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {data.raw_text && (
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-2">原文</h2>
          <pre className="p-4 bg-gray-100 dark:bg-gray-900 rounded-lg whitespace-pre-wrap text-sm overflow-x-auto max-h-96">
            {data.raw_text}
          </pre>
        </div>
      )}
    </div>
  );
}
