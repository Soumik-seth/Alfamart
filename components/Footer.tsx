"use client";

import { useEffect, useState } from "react";

export default function CopyrightYear() {
  const [year, setYear] = useState<number | null>(null);

  useEffect(() => {
    const frameId = window.requestAnimationFrame(() => {
      setYear(new Date().getFullYear());
    });

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return <>{year ?? ""}</>;
}