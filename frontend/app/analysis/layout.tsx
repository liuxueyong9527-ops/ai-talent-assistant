"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Layout } from "@/components/Layout";

export default function AnalysisLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  useEffect(() => {
    if (!localStorage.getItem("token")) router.replace("/login");
  }, [router]);
  return <Layout>{children}</Layout>;
}
