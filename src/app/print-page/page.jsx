"use client";

import dynamic from "next/dynamic";

const PrintContent = dynamic(
  () => import("./PrintContent"),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-screen items-center justify-center">
        กำลังโหลด Report...
      </div>
    ),
  }
);

export default function PrintPage() {
  return <PrintContent />;
}