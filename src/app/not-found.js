// app/not-found.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/upload"); // redirect to /upload
  }, []);

  return null; // or a loading spinner while redirecting
}
