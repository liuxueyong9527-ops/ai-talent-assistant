"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import { Select } from "@/components/Select";

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
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">匹配分析</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">选择简历与职位描述，获取 AI 智能匹配报告</p>
        </div>
        {docs?.length === 0 ? (
          <div className="text-center p-8 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
            <p className="text-slate-600 dark:text-slate-400 mb-4">请先上传简历和职位描述</p>
            <Link
              href="/upload"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              去上传
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleMatch} className="space-y-5">
              {error && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-center">
                  {error}
                </div>
              )}
              <Select
                label="选择简历"
                value={resumeId}
                onChange={(e) => setResumeId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">请选择简历</option>
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.original_filename}
                  </option>
                ))}
              </Select>
              <Select
                label="选择职位描述"
                value={jdId}
                onChange={(e) => setJdId(e.target.value ? Number(e.target.value) : "")}
              >
                <option value="">请选择职位描述</option>
                {jds.map((j) => (
                  <option key={j.id} value={j.id}>
                    {j.original_filename}
                  </option>
                ))}
              </Select>
              <button
                type="submit"
                disabled={!resumeId || !jdId || loading}
                className="w-full py-3.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
              >
                {loading ? "AI 分析中..." : "开始匹配"}
              </button>
            </form>
            {analysisId && (
              <div className="mt-6 p-5 text-center rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200/80 dark:border-emerald-800/50">
                <p className="mb-3 text-slate-800 dark:text-slate-200 font-medium">分析完成！</p>
                <Link
                  href={`/analysis/${analysisId}`}
                  className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium"
                >
                  查看匹配报告
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
