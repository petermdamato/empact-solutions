// app/error.js
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function GlobalError({ error, reset }) {
  const router = useRouter();

  useEffect(() => {
    router.replace("/detention-overview");
  }, []);

  return null;
}
