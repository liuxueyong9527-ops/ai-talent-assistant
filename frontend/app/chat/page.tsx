"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/api";

export default function ChatPage() {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;
    const userMsg = { role: "user", content: message };
    setMessages((m) => [...m, userMsg]);
    setMessage("");
    setLoading(true);
    try {
      const res = await apiFetch<{ role: string; content: string }>("/api/chat", {
        method: "POST",
        body: JSON.stringify({ message }),
      });
      setMessages((m) => [...m, res]);
    } catch (err) {
      setMessages((m) => [
        ...m,
        { role: "assistant", content: "发生错误，请稍后重试。" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center min-h-[calc(100vh-12rem)] py-8">
      <div className="w-full max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">AI 职业助手</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">基于您的简历与职位描述，解答职业问题、提供改进建议</p>
        </div>
        <div className="h-96 border border-slate-200 dark:border-slate-700 rounded-2xl overflow-y-auto p-5 mb-4 bg-white dark:bg-slate-800/80 shadow-sm">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <div className="w-14 h-14 rounded-2xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center mb-4">
                <svg className="w-7 h-7 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <p className="text-slate-600 dark:text-slate-400">发送消息开始对话</p>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">我可以基于您上传的简历和职位描述，解答职业相关问题、提供改进建议</p>
            </div>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}
              >
                <span
                  className={
                    m.role === "user"
                      ? "inline-block px-4 py-2 bg-cyan-600 text-white rounded-xl max-w-[80%]"
                      : "inline-block px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl max-w-[80%] text-left whitespace-pre-wrap"
                  }
                >
                  {m.content}
                </span>
              </div>
            ))
          )}
          {loading && (
            <div className="text-left mb-4">
              <span className="inline-block px-4 py-2 bg-slate-200 dark:bg-slate-700 rounded-xl animate-pulse">
                思考中...
              </span>
            </div>
          )}
        </div>
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-cyan-600 text-white font-medium rounded-xl hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all duration-200"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
}
