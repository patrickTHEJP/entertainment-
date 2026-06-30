"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page since login is now handled via modal
    router.push("/");
  }, [router]);

  return null; // Return null while redirecting
}
