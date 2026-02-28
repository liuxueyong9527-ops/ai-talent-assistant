"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiUpload } from "@/lib/api";

export default function UploadPage() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<"resume" | "jd">("resume");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError("");
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);
      await apiUpload("/api/documents/upload", formData);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const allowedTypes = [".pdf", ".doc", ".docx"];
  const isValid = file && allowedTypes.some((ext) => file.name.toLowerCase().endsWith(ext));

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">上传文档</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg">
            {error}
          </div>
        )}
        <div>
          <label className="block text-sm font-medium mb-2">文档类型</label>
          <select
            value={docType}
            onChange={(e) => setDocType(e.target.value as "resume" | "jd")}
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          >
            <option value="resume">简历</option>
            <option value="jd">职位描述</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">选择文件 (PDF / DOC / DOCX)</label>
          <div
            className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-8 text-center hover:border-blue-500 transition cursor-pointer"
            onClick={() => document.getElementById("file-input")?.click()}
          >
            <input
              id="file-input"
              type="file"
              accept=".pdf,.doc,.docx"
              className="hidden"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            {file ? (
              <p className="text-gray-700 dark:text-gray-300">{file.name}</p>
            ) : (
              <p className="text-gray-500">点击或拖拽文件到此处</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? "上传中..." : "上传"}
        </button>
      </form>
    </div>
  );
}
