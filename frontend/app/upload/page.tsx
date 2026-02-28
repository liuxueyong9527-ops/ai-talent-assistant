"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { apiUpload } from "@/lib/api";
import { Select } from "@/components/Select";

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
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">上传文档</h1>
      <form onSubmit={handleSubmit} className="max-w-md space-y-4">
        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl">
            {error}
          </div>
        )}
        <Select
          label="文档类型"
          value={docType}
          onChange={(e) => setDocType(e.target.value as "resume" | "jd")}
        >
          <option value="resume">简历</option>
          <option value="jd">职位描述</option>
        </Select>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">选择文件 (PDF / DOC / DOCX)</label>
          <div
            className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl p-8 text-center hover:border-cyan-500 dark:hover:border-cyan-500/50 transition cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
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
              <p className="text-slate-700 dark:text-slate-300 font-medium">{file.name}</p>
            ) : (
              <p className="text-slate-500">点击或拖拽文件到此处</p>
            )}
          </div>
        </div>
        <button
          type="submit"
          disabled={!isValid || loading}
          className="w-full py-3 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-500/25 transition"
        >
          {loading ? "上传中..." : "上传"}
        </button>
      </form>
    </div>
  );
}
