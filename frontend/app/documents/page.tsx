"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

interface Document {
  id: number;
  type: string;
  original_filename: string;
  created_at: string;
}

export default function DocumentsPage() {
  const { data: docs, isLoading } = useQuery({
    queryKey: ["documents"],
    queryFn: () => apiFetch<Document[]>("/api/documents/"),
  });

  if (isLoading) {
    return <div className="text-gray-500">加载中...</div>;
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">我的文档</h1>
      <Link
        href="/upload"
        className="inline-block mb-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
      >
        上传新文档
      </Link>
      {docs?.length === 0 ? (
        <p className="text-gray-500">暂无文档，请先上传。</p>
      ) : (
        <div className="space-y-2">
          {docs?.map((d) => (
            <Link
              key={d.id}
              href={`/documents/${d.id}`}
              className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow hover:shadow-md transition"
            >
              <span className="font-medium">{d.original_filename}</span>
              <span className="text-sm text-gray-500 ml-2">
                {d.type === "resume" ? "简历" : "JD"} · {d.created_at}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
