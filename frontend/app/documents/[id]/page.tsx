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
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  const exp = data.extraction?.experience as { company?: string; role?: string; duration?: string }[] | undefined;
  const edu = data.extraction?.education as { school?: string; degree?: string; year?: string }[] | undefined;

  return (
    <div className="max-w-3xl">
      <Link
        href="/documents"
        className="inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium mb-6"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back to Documents
      </Link>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">{data.original_filename}</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm">
          {data.type === "resume" ? "Resume" : "Job Description"} · {data.created_at}
        </p>
      </div>

      {data.extraction && data.extraction.skills?.length > 0 && (
        <div className="mb-6 p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Skills</h2>
          <div className="flex flex-wrap gap-2">
            {data.extraction.skills.map((s, i) => (
              <span
                key={i}
                className="px-3 py-1 bg-cyan-100 dark:bg-cyan-900/40 text-cyan-800 dark:text-cyan-200 rounded-full text-sm"
              >
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {exp && exp.length > 0 && (
        <div className="mb-6 p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Work Experience</h2>
          <ul className="space-y-2">
            {exp.map((e, i) => (
              <li key={i} className="border-l-2 border-cyan-500 pl-4">
                <span className="font-medium text-slate-900 dark:text-white">{e.role || "Role"}</span>
                <span className="text-slate-500"> @ {e.company || "Company"}</span>
                {e.duration && <span className="text-sm text-slate-400"> · {e.duration}</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {edu && edu.length > 0 && (
        <div className="mb-6 p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Education</h2>
          <ul className="space-y-2 text-slate-700 dark:text-slate-300">
            {edu.map((e, i) => (
              <li key={i}>
                {e.degree || "Degree"} · {e.school || "School"}
                {e.year && <span className="text-slate-500"> ({e.year})</span>}
              </li>
            ))}
          </ul>
        </div>
      )}

      {data.type === "resume" && (
        <div className="mb-6 p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">AI Career Advice</h2>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              placeholder="Target role (optional)"
              className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
            />
            <button
              onClick={fetchCareerAdvice}
              disabled={careerLoading}
              className="px-5 py-2.5 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
            >
              {careerLoading ? "Generating..." : "Get Advice"}
            </button>
          </div>
          {careerData && (
            <div className="mt-4 space-y-4">
              {careerData.resume_tips?.length > 0 && (
                <div>
                  <h3 className="font-medium text-green-700 dark:text-green-400">Resume Tips</h3>
                  <ul className="list-disc list-inside mt-1">
                    {careerData.resume_tips.map((t, i) => (
                      <li key={i}>{t}</li>
                    ))}
                  </ul>
                </div>
              )}
              {careerData.skill_roadmap?.length > 0 && (
                <div>
                  <h3 className="font-medium text-cyan-700 dark:text-cyan-400">Skill Roadmap</h3>
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
                  <h3 className="font-medium text-teal-700 dark:text-teal-400">Learning Suggestions</h3>
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
        <div className="p-5 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Original Text</h2>
          <pre className="p-4 bg-slate-100 dark:bg-slate-900 rounded-xl whitespace-pre-wrap text-sm overflow-x-auto max-h-96 text-slate-700 dark:text-slate-300">
            {data.raw_text}
          </pre>
        </div>
      )}
    </div>
  );
}
