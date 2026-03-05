"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Document {
  id: number;
  type: string;
  original_filename: string;
  created_at: string;
}

export default function DocumentsPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => apiFetch<Document[]>("/api/documents/"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) =>
      apiFetch(`/api/documents/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setDeletingId(null);
    },
    onError: () => setDeletingId(null),
  });

  const handleDelete = (d: Document) => {
    if (!confirm(`Are you sure you want to delete "${d.original_filename}"? This action cannot be undone.`)) return;
    setDeletingId(d.id);
    deleteMutation.mutate(d.id);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
        <p className="mt-4 text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">My Documents</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Manage your resumes and job descriptions</p>
        </div>
        <Link
          href="/upload"
          className="inline-flex items-center gap-2 px-6 py-3.5 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-700 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200 shrink-0"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload New Document
        </Link>
      </div>
      {docs?.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 rounded-2xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <p className="text-slate-600 dark:text-slate-400 mb-6">No documents yet. Please upload first.</p>
          <Link
            href="/upload"
            className="inline-flex items-center gap-2 px-6 py-3.5 bg-cyan-600 hover:bg-cyan-700 text-white font-medium rounded-xl shadow-lg shadow-cyan-500/25 transition"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            Upload
          </Link>
        </div>
      ) : (
        <div className="space-y-3 max-w-2xl">
          {docs?.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm hover:border-cyan-300/50 dark:hover:border-cyan-500/30 hover:shadow-md transition group"
            >
              <Link href={`/documents/${d.id}`} className="flex-1 min-w-0">
                <span className="font-medium text-slate-900 dark:text-white">{d.original_filename}</span>
                <span className="text-sm text-slate-500 ml-2">
                  {d.type === "resume" ? "Resume" : "JD"} · {d.created_at}
                </span>
              </Link>
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleDelete(d);
                }}
                disabled={deletingId === d.id}
                className="ml-3 px-3 py-1.5 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-50"
              >
                {deletingId === d.id ? "Deleting..." : "Delete"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
