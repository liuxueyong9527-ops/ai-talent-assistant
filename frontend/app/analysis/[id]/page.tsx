"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface MatchAnalysis {
  id: number;
  resume_id: number;
  jd_id: number;
  match_score: number;
  matched_skills: string[];
  skill_gaps: string[];
  improvement_suggestions: string[];
  created_at: string;
}

export default function AnalysisDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const { data, isLoading } = useQuery({
    queryKey: ["analysis", id],
    queryFn: () => apiFetch<MatchAnalysis>(`/api/analysis/${id}`),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-slate-500 dark:text-slate-400">加载中...</p>
      </div>
    );
  }
  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px] text-slate-500 dark:text-slate-400">
        分析不存在
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <Link
        href="/analysis"
        className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        返回匹配分析
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">匹配分析报告</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">{data.created_at}</p>
      </div>

      <div className="mb-8 p-6 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">匹配分数</h2>
        <div className="flex items-center gap-4">
          <div className="w-28 h-28 rounded-full bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
            <span className="text-3xl font-bold text-cyan-600 dark:text-cyan-400">{data.match_score}%</span>
          </div>
          <p className="text-slate-600 dark:text-slate-400">
            您的简历与职位描述的匹配程度
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-emerald-700 dark:text-emerald-400">已匹配技能</h2>
          {data.matched_skills?.length ? (
            <ul className="space-y-1">
              {data.matched_skills.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-emerald-500">✓</span> {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">暂无</p>
          )}
        </div>
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-semibold mb-3 text-amber-700 dark:text-amber-400">技能差距</h2>
          {data.skill_gaps?.length ? (
            <ul className="space-y-1">
              {data.skill_gaps.map((s, i) => (
                <li key={i} className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <span className="text-amber-500">!</span> {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-slate-500">暂无</p>
          )}
        </div>
      </div>

      <div className="mt-6 p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
        <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-3">改进建议</h2>
        {data.improvement_suggestions?.length ? (
          <ul className="list-disc list-inside space-y-2 text-slate-700 dark:text-slate-300">
            {data.improvement_suggestions.map((s, i) => (
              <li key={i}>{s}</li>
            ))}
          </ul>
        ) : (
          <p className="text-slate-500">暂无</p>
        )}
      </div>
    </div>
  );
}
