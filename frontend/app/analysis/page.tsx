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
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">匹配分析</h1>
      {docs?.length === 0 ? (
        <p className="text-slate-500 mb-4">
          请先 <Link href="/upload" className="text-cyan-600 hover:text-cyan-700 font-medium">上传</Link> 简历和职位描述
        </p>
      ) : null}
      <form onSubmit={handleMatch} className="max-w-md space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl">
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
          className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-500/25 transition"
        >
          {loading ? "AI 分析中..." : "开始匹配"}
        </button>
      </form>
      {analysisId && (
        <div className="mt-6 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200/80 dark:border-emerald-800/50">
          <p className="mb-2 text-slate-800 dark:text-slate-200">分析完成！</p>
          <Link
            href={`/analysis/${analysisId}`}
            className="text-cyan-600 hover:text-cyan-700 font-medium"
          >
            查看匹配报告 →
          </Link>
        </div>
      )}
    </div>
  );
}
