"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const icons = {
  dashboard: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
    </svg>
  ),
  upload: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
    </svg>
  ),
  documents: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  analysis: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  chat: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  logout: (
    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/");
    router.refresh();
  };

  const navLinks = [
    { href: "/dashboard", label: "仪表板", icon: icons.dashboard },
    { href: "/upload", label: "上传", icon: icons.upload },
    { href: "/documents", label: "文档", icon: icons.documents },
    { href: "/analysis", label: "匹配分析", icon: icons.analysis },
    { href: "/chat", label: "AI 助手", icon: icons.chat },
  ] as const;

  const isActive = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const linkClass = (href: string) =>
    isActive(href)
      ? "text-cyan-600 dark:text-cyan-400 font-medium"
      : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200";

  return (
    <div className="min-h-screen flex flex-col bg-slate-50/50 dark:bg-slate-950">
      <nav className="border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="flex items-center gap-2 shrink-0 group transition-transform hover:scale-[1.02]"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-sm">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
              </svg>
            </span>
            <span className="font-semibold">
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent dark:from-cyan-400 dark:to-blue-400">
                AI
              </span>
              <span className="text-slate-700 dark:text-slate-300"> 人才助手</span>
            </span>
          </Link>
          {/* 桌面端：居中菜单 */}
          <div className="hidden md:flex flex-1 justify-center gap-6">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className={`flex items-center gap-1.5 ${linkClass(link.href)}`}>
                {link.icon}
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 hover:text-red-600"
            >
              {icons.logout}
              退出
            </button>
            {/* 移动端：汉堡菜单按钮 */}
            <button
              type="button"
              onClick={() => setMenuOpen((o) => !o)}
              className="md:hidden p-2 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
              aria-label="切换菜单"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {menuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* 移动端：下拉菜单 */}
        {menuOpen && (
          <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="max-w-6xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`flex items-center gap-2 py-2 px-3 rounded-lg ${linkClass(link.href)}`}
                >
                  {link.icon}
                  {link.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="flex items-center gap-2 py-2 px-3 rounded-lg text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                {icons.logout}
                退出
              </button>
            </div>
          </div>
        )}
      </nav>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-6">{children}</main>
    </div>
  );
}
