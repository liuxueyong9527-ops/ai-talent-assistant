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
      <h1 className="text-2xl font-bold mb-6">AI 职业助手</h1>
      <div className="max-w-2xl mx-auto">
        <div className="h-96 border border-gray-200 dark:border-gray-700 rounded-lg overflow-y-auto p-4 mb-4 bg-white dark:bg-gray-800">
          {messages.length === 0 ? (
            <p className="text-gray-500">发送消息开始对话。我可以基于您上传的简历和职位描述，解答职业相关问题、提供改进建议。</p>
          ) : (
            messages.map((m, i) => (
              <div
                key={i}
                className={`mb-4 ${m.role === "user" ? "text-right" : "text-left"}`}
              >
                <span
                  className={
                    m.role === "user"
                      ? "inline-block px-4 py-2 bg-blue-600 text-white rounded-lg max-w-[80%]"
                      : "inline-block px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg max-w-[80%] text-left whitespace-pre-wrap"
                  }
                >
                  {m.content}
                </span>
              </div>
            ))
          )}
          {loading && (
            <div className="text-left mb-4">
              <span className="inline-block px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse">
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
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            发送
          </button>
        </form>
      </div>
    </div>
  );
}
