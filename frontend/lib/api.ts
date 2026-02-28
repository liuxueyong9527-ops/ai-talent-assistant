const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (res.status === 401) {
    // 登录接口的 401 表示密码错误，不重定向，让调用方处理错误提示
    const isLoginEndpoint = path.includes("/auth/login");
    if (typeof window !== "undefined" && !isLoginEndpoint) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    if (isLoginEndpoint) {
      const err = await res.json().catch(() => ({ detail: "Incorrect email or password" }));
      throw new Error(err.detail || "邮箱或密码错误");
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  if (res.headers.get("content-type")?.includes("application/json")) {
    return res.json();
  }
  return res.text() as Promise<T>;
}

export async function apiUpload<T>(
  path: string,
  formData: FormData
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers,
  });

  if (res.status === 401) {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
    throw new Error("Unauthorized");
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || "Request failed");
  }

  return res.json();
}
