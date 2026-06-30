"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page since registration is now handled via modal
    router.push("/");
  }, [router]);

  return null; // Return null while redirecting
}
