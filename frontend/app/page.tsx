import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
      <h1 className="text-4xl font-bold mb-4">AI 智能人才助手</h1>
      <p className="text-lg text-gray-600 dark:text-gray-400 mb-8">
        上传简历与职位描述，获取 AI 分析与职业建议
      </p>
      <div className="flex gap-4">
        <Link
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          登录
        </Link>
        <Link
          href="/register"
          className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          注册
        </Link>
      </div>
    </main>
  );
}
