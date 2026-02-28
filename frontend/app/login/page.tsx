"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch } from "@/lib/api";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem("token")) {
      router.replace("/dashboard");
    }
  }, [router]);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await apiFetch<{ access_token: string }>("/api/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem("token", res.access_token);
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen relative overflow-hidden flex items-center justify-center p-8">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-white to-cyan-50/30 dark:from-slate-950 dark:via-slate-900 dark:to-slate-900" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-cyan-200/20 dark:bg-cyan-500/10 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-1/4 w-80 h-80 bg-teal-200/20 dark:bg-teal-500/10 rounded-full blur-3xl" />
      <div className="relative w-full max-w-md">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 -ml-4 mb-6 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:text-cyan-600 dark:hover:text-cyan-400 hover:bg-slate-100/80 dark:hover:bg-slate-800/50 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          返回首页
        </Link>
        <div className="p-8 rounded-2xl bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm border border-slate-200/80 dark:border-slate-700/50 shadow-xl shadow-slate-200/50 dark:shadow-none">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-cyan-100 dark:bg-cyan-900/40 flex items-center justify-center">
              <svg className="w-5 h-5 text-cyan-600 dark:text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">登录</h1>
              <p className="text-sm text-slate-500 dark:text-slate-400">欢迎回来</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-xl border border-red-200/80 dark:border-red-800/50">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">邮箱</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="your@email.com"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-slate-400"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">密码</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl bg-slate-50/50 dark:bg-slate-900/50 focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-cyan-600 text-white rounded-xl hover:bg-cyan-700 disabled:opacity-50 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 transition-all font-medium"
            >
              {loading ? "登录中..." : "登录"}
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-700">
            <p className="text-center text-sm text-slate-600 dark:text-slate-400">
              还没有账号？{" "}
              <Link href="/register" className="text-cyan-600 hover:text-cyan-700 dark:text-cyan-400 dark:hover:text-cyan-300 font-medium hover:underline underline-offset-2">
                立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
