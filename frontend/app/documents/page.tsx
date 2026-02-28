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
    if (!confirm(`确定要删除「${d.original_filename}」吗？此操作不可恢复。`)) return;
    setDeletingId(d.id);
    deleteMutation.mutate(d.id);
  };

  if (isLoading) {
    return <div className="text-slate-500">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">我的文档</h1>
      <Link
        href="/upload"
        className="inline-block mb-4 px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 shadow-lg shadow-cyan-500/25 transition"
      >
        上传新文档
      </Link>
      {docs?.length === 0 ? (
        <p className="text-slate-500">暂无文档，请先上传。</p>
      ) : (
        <div className="space-y-3">
          {docs?.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between p-4 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/80 dark:border-slate-700/50 shadow-sm hover:border-cyan-300/50 dark:hover:border-cyan-500/30 hover:shadow-md transition group"
            >
              <Link href={`/documents/${d.id}`} className="flex-1 min-w-0">
                <span className="font-medium text-slate-900 dark:text-white">{d.original_filename}</span>
                <span className="text-sm text-slate-500 ml-2">
                  {d.type === "resume" ? "简历" : "JD"} · {d.created_at}
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
                {deletingId === d.id ? "删除中..." : "删除"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
