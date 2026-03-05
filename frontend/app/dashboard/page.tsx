"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { apiFetch } from "@/lib/api";

interface SkillItem {
  skill: string;
  count: number;
}

interface AnalysisItem {
  id: number;
  resume_id: number;
  jd_id: number;
  match_score: number;
  created_at: string;
}

interface DashboardStats {
  total_documents: number;
  resumes_count: number;
  jds_count: number;
  analyses_count: number;
  avg_match_score: number;
  skill_distribution: SkillItem[];
  recent_analyses: AnalysisItem[];
}

const COLORS = ["#0891b2", "#22d3ee", "#67e8f9", "#a5f3fc", "#cffafe"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<DashboardStats>("/api/dashboard/stats"),
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  const topSkills = data?.skill_distribution?.slice(0, 10) ?? [];
  const pieData = topSkills.map((s, i) => ({
    name: s.skill,
    value: s.count,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">Overview of your documents and match analysis</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <p className="text-sm text-slate-600 dark:text-slate-400">Total Documents</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.total_documents ?? 0}</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <p className="text-sm text-slate-600 dark:text-slate-400">Resumes</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.resumes_count ?? 0}</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <p className="text-sm text-slate-600 dark:text-slate-400">Job Descriptions</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{data?.jds_count ?? 0}</p>
        </div>
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <p className="text-sm text-slate-600 dark:text-slate-400">Avg. Match Score</p>
          <p className="text-2xl font-bold text-cyan-600 dark:text-cyan-400">{data?.avg_match_score ?? 0}%</p>
        </div>
      </div>

      {topSkills.length > 0 && (
        <div className="mb-8 p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Skill Distribution</h2>
          <div className="flex gap-8">
            <div className="w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="skill" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#0891b2" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={2}
                    dataKey="value"
                    nameKey="name"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {data?.recent_analyses && data.recent_analyses.length > 0 && (
        <div className="mb-8 p-6 bg-white dark:bg-slate-800/80 rounded-2xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Recent Analyses</h2>
          <div className="space-y-2">
            {data.recent_analyses.map((a) => (
              <Link
                key={a.id}
                href={`/analysis/${a.id}`}
                className="block p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700/50 transition"
              >
                <span className="font-medium text-slate-900 dark:text-white">Analysis #{a.id}</span>
                <span className="text-cyan-600 dark:text-cyan-400 ml-2">Match {a.match_score}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/upload"
          className="px-6 py-3.5 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-700 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
        >
          Upload Document
        </Link>
        <Link
          href="/analysis"
          className="px-6 py-3.5 border-2 border-slate-200 dark:border-slate-600 rounded-xl font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/50 hover:border-slate-300 dark:hover:border-slate-500 transition-all duration-200"
        >
          Match Analysis
        </Link>
      </div>
    </div>
  );
}
