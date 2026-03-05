"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { apiUpload } from "@/lib/api";
import { Select } from "@/components/Select";

export default function UploadPage() {
  const queryClient = useQueryClient();
  const [file, setFile] = useState<File | null>(null);
  const [docType, setDocType] = useState<"resume" | "jd">("resume");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setError("");
    setSuccess(false);
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("doc_type", docType);
      await apiUpload("/api/documents/upload", formData);
      queryClient.invalidateQueries({ queryKey: ["documents"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-stats"] });
      setSuccess(true);
      setFile(null);
      (document.getElementById("file-input") as HTMLInputElement).value = "";
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const allowedTypes = [".pdf", ".doc", ".docx"];
  const isValid = file && allowedTypes.some((ext) => file.name.toLowerCase().endsWith(ext));

  const uploadIcon = (
    <svg className="w-12 h-12 text-cyan-500 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  );

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-12rem)] py-8">
      <div className="w-full max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Upload Document</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">Supports PDF, DOC, DOCX formats</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-xl text-center">
              {error}
            </div>
          )}
          {success && (
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-xl text-center">
              Upload successful
            </div>
          )}
          <Select
            label="Document Type"
            value={docType}
            onChange={(e) => setDocType(e.target.value as "resume" | "jd")}
          >
            <option value="resume">Resume</option>
            <option value="jd">Job Description</option>
          </Select>
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2 text-center">Select File</label>
            <div
              className="border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-2xl p-10 text-center hover:border-cyan-500 dark:hover:border-cyan-500/50 hover:bg-cyan-50/30 dark:hover:bg-cyan-900/10 transition-all duration-200 cursor-pointer bg-slate-50/50 dark:bg-slate-800/30"
              onClick={() => document.getElementById("file-input")?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) => {
                setFile(e.target.files?.[0] || null);
                setSuccess(false);
              }}
              />
              {file ? (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-14 h-14 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
                    <svg className="w-7 h-7 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <p className="text-slate-700 dark:text-slate-300 font-medium truncate max-w-full px-2">{file.name}</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">Click to choose another file</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-2xl bg-cyan-100/80 dark:bg-cyan-900/30 flex items-center justify-center">
                    {uploadIcon}
                  </div>
                  <p className="text-slate-600 dark:text-slate-400 font-medium">Click or drag file here</p>
                  <p className="text-slate-400 dark:text-slate-500 text-sm">PDF / DOC / DOCX</p>
                </div>
              )}
            </div>
          </div>
          <button
            type="submit"
            disabled={!isValid || loading}
            className="w-full py-3.5 bg-cyan-600 text-white rounded-xl font-medium hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
          >
            {loading ? "Uploading..." : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
