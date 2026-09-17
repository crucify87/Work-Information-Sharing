"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f6f7f4] px-5 py-10 text-[#1c201c]">
      <section className="w-full max-w-md rounded-lg border border-[#d9ded4] bg-white p-6 text-center shadow-sm">
        <span className="mx-auto inline-flex h-11 w-11 items-center justify-center rounded-md bg-[#fff2eb] text-[#b44923]">
          <AlertTriangle className="h-5 w-5" aria-hidden="true" />
        </span>
        <h1 className="mt-4 text-xl font-semibold">화면을 불러오지 못했습니다</h1>
        <p className="mt-2 text-sm leading-6 text-[#687266]">
          잠시 후 다시 시도해 주세요. 등록한 업무는 이 기기에 보관됩니다.
        </p>
        <button
          className="mt-5 inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#22362b] px-4 text-sm font-bold text-white transition hover:bg-[#314c3d] focus:outline-none focus:ring-2 focus:ring-[#8ba394]"
          onClick={reset}
          type="button"
        >
          <RefreshCw className="h-4 w-4" aria-hidden="true" />
          다시 시도
        </button>
      </section>
    </main>
  );
}
