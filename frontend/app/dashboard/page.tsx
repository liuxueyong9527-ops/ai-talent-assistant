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

const COLORS = ["#3b82f6", "#60a5fa", "#93c5fd", "#bfdbfe", "#dbeafe"];

export default function DashboardPage() {
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: () => apiFetch<DashboardStats>("/api/dashboard/stats"),
  });

  if (isLoading) {
    return <div className="text-gray-500">加载中...</div>;
  }

  const topSkills = data?.skill_distribution?.slice(0, 10) ?? [];
  const pieData = topSkills.map((s, i) => ({
    name: s.skill,
    value: s.count,
    fill: COLORS[i % COLORS.length],
  }));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">仪表板</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">总文档数</p>
          <p className="text-2xl font-bold">{data?.total_documents ?? 0}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">简历数</p>
          <p className="text-2xl font-bold">{data?.resumes_count ?? 0}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">职位描述数</p>
          <p className="text-2xl font-bold">{data?.jds_count ?? 0}</p>
        </div>
        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-600 dark:text-gray-400">平均匹配分</p>
          <p className="text-2xl font-bold">{data?.avg_match_score ?? 0}%</p>
        </div>
      </div>

      {topSkills.length > 0 && (
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">技能分布</h2>
          <div className="flex gap-8">
            <div className="w-1/2 h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topSkills} layout="vertical" margin={{ left: 80 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis type="category" dataKey="skill" width={80} tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#3b82f6" />
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
        <div className="mb-8 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">最近分析</h2>
          <div className="space-y-2">
            {data.recent_analyses.map((a) => (
              <Link
                key={a.id}
                href={`/analysis/${a.id}`}
                className="block p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <span className="font-medium">分析 #{a.id}</span>
                <span className="text-blue-600 ml-2">匹配 {a.match_score}%</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-4">
        <Link
          href="/upload"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          上传文档
        </Link>
        <Link
          href="/analysis"
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          匹配分析
        </Link>
      </div>
    </div>
  );
}
