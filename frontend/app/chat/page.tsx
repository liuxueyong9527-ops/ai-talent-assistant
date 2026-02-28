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
    <div>
      <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">AI 职业助手</h1>
      <div className="max-w-2xl mx-auto">
        <div className="h-96 border border-slate-200 dark:border-slate-700 rounded-xl overflow-y-auto p-4 mb-4 bg-white dark:bg-slate-800/80 shadow-sm">
          {messages.length === 0 ? (
            <p className="text-slate-500">发送消息开始对话。我可以基于您上传的简历和职位描述，解答职业相关问题、提供改进建议。</p>
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
        <form onSubmit={handleSubmit} className="flex gap-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 px-4 py-2.5 border border-slate-200 dark:border-slate-600 rounded-xl bg-white dark:bg-slate-800 focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-2.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-500/25 transition"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
}
