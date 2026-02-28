"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Document {
  id: number;
  type: string;
  original_filename: string;
  created_at: string;
}

export default function AnalysisPage() {
  const [resumeId, setResumeId] = useState<number | "">("");
  const [jdId, setJdId] = useState<number | "">("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [analysisId, setAnalysisId] = useState<number | null>(null);

  const { data: docs, refetch } = useQuery({
    queryKey: ["documents"],
    queryFn: () => apiFetch<Document[]>("/api/documents/"),
  });

  const resumes = docs?.filter((d) => d.type === "resume") ?? [];
  const jds = docs?.filter((d) => d.type === "jd") ?? [];

  const handleMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resumeId || !jdId) return;
    setError("");
    setLoading(true);
    setAnalysisId(null);
    try {
      const res = await apiFetch<{ id: number }>("/api/analysis/match", {
        method: "POST",
        body: JSON.stringify({ resume_id: Number(resumeId), jd_id: Number(jdId) }),
      });
      setAnalysisId(res.id);
      refetch();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Match failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">匹配分析</h1>
      {docs?.length === 0 ? (
        <p className="text-gray-500 mb-4">
          请先 <Link href="/upload" className="text-blue-600 hover:underline">上传</Link> 简历和职位描述
        </p>
      ) : null}
      <form onSubmit={handleMatch} className="max-w-md space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-1">选择简历</label>
          <select
            value={resumeId}
            onChange={(e) => setResumeId(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">-- 选择 --</option>
            {resumes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.original_filename}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">选择职位描述</label>
          <select
            value={jdId}
            onChange={(e) => setJdId(e.target.value ? Number(e.target.value) : "")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="">-- 选择 --</option>
            {jds.map((j) => (
              <option key={j.id} value={j.id}>
                {j.original_filename}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          disabled={!resumeId || !jdId || loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "AI 分析中..." : "开始匹配"}
        </button>
      </form>
      {analysisId && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
          <p className="mb-2">分析完成！</p>
          <Link
            href={`/analysis/${analysisId}`}
            className="text-blue-600 hover:underline font-medium"
          >
            查看匹配报告 →
          </Link>
        </div>
      )}
    </div>
  );
}
