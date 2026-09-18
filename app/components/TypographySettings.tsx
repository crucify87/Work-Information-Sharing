"use client";

import { RotateCcw, Type, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const STORAGE_KEY = "business-work-hub-typography";

const fontOptions = [
  {
    id: "default",
    label: "기본 글꼴",
    stack: 'var(--font-geist-sans), "Malgun Gothic", Arial, sans-serif',
  },
  {
    id: "malgun",
    label: "맑은 고딕",
    stack: '"Malgun Gothic", "Apple SD Gothic Neo", sans-serif',
  },
  {
    id: "dotum",
    label: "돋움",
    stack: 'Dotum, "Apple SD Gothic Neo", sans-serif',
  },
  {
    id: "serif",
    label: "명조",
    stack: 'Batang, "Noto Serif KR", serif',
  },
  {
    id: "mono",
    label: "고정폭",
    stack: '"D2Coding", Consolas, monospace',
  },
] as const;

type FontId = (typeof fontOptions)[number]["id"];

function applyTypography(fontId: FontId, scale: number) {
  const font = fontOptions.find((option) => option.id === fontId) ?? fontOptions[0];
  document.documentElement.style.setProperty("--app-font-family", font.stack);
  document.documentElement.style.setProperty(
    "--app-font-size",
    `${(16 * scale) / 100}px`,
  );
}

export function TypographySettings() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontId, setFontId] = useState<FontId>("default");
  const [scale, setScale] = useState(100);
  const [isReady, setIsReady] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const saved = window.localStorage.getItem(STORAGE_KEY);
        if (saved) {
          const parsed = JSON.parse(saved) as {
            fontId?: unknown;
            scale?: unknown;
          };
          const savedFont = fontOptions.some(
            (option) => option.id === parsed.fontId,
          )
            ? (parsed.fontId as FontId)
            : "default";
          const savedScale = Number(parsed.scale);
          const safeScale = Number.isFinite(savedScale)
            ? Math.min(120, Math.max(90, Math.round(savedScale)))
            : 100;
          setFontId(savedFont);
          setScale(safeScale);
          applyTypography(savedFont, safeScale);
        }
      } catch {
        applyTypography("default", 100);
      }
      setIsReady(true);
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    applyTypography(fontId, scale);
    if (!isReady) {
      return;
    }
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ fontId, scale }));
    } catch {
      // Typography changes still apply for the current session.
    }
  }, [fontId, isReady, scale]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function closePanel(event: MouseEvent) {
      if (!panelRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    function closeWithEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", closePanel);
    document.addEventListener("keydown", closeWithEscape);
    return () => {
      document.removeEventListener("mousedown", closePanel);
      document.removeEventListener("keydown", closeWithEscape);
    };
  }, [isOpen]);

  function resetTypography() {
    setFontId("default");
    setScale(100);
  }

  return (
    <div className="relative self-start" ref={panelRef}>
      <button
        aria-expanded={isOpen}
        aria-haspopup="dialog"
        className="inline-flex h-10 items-center justify-center gap-2 whitespace-nowrap rounded-md border border-[#cfd6ca] bg-white px-3 text-sm font-bold text-[#344238] shadow-sm transition hover:border-[#9eaa9c] hover:bg-[#f6f8f4] focus:outline-none focus:ring-2 focus:ring-[#22362b]"
        onClick={() => setIsOpen((current) => !current)}
        type="button"
      >
        <Type className="h-4 w-4" aria-hidden="true" />
        글꼴 설정
      </button>

      {isOpen ? (
        <section
          aria-label="글꼴 설정"
          className="absolute right-0 top-12 z-50 w-[min(320px,calc(100vw-2.5rem))] rounded-lg border border-[#d9ded4] bg-white p-4 shadow-xl"
          role="dialog"
        >
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-base font-semibold text-[#1c201c]">글꼴 설정</h2>
            <button
              aria-label="글꼴 설정 닫기"
              className="inline-flex h-8 w-8 items-center justify-center rounded-md text-[#687266] transition hover:bg-[#eef1eb] focus:outline-none focus:ring-2 focus:ring-[#22362b]"
              onClick={() => setIsOpen(false)}
              title="닫기"
              type="button"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <label className="mt-4 grid gap-1.5 text-sm font-semibold text-[#4d574c]">
            글꼴 종류
            <select
              className="h-10 w-full rounded-md border border-[#d5dbd0] bg-white px-3 font-normal text-[#1c201c] outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
              onChange={(event) => setFontId(event.target.value as FontId)}
              value={fontId}
            >
              {fontOptions.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="mt-4 grid gap-2 text-sm font-semibold text-[#4d574c]">
            <span className="flex items-center justify-between gap-3">
              글자 크기
              <output className="tabular-nums text-[#22362b]">{scale}%</output>
            </span>
            <input
              aria-label="글자 크기"
              className="w-full accent-[#22362b]"
              max="120"
              min="90"
              onChange={(event) => setScale(Number(event.target.value))}
              step="5"
              type="range"
              value={scale}
            />
          </label>

          <button
            className="mt-5 inline-flex h-9 w-full items-center justify-center gap-2 rounded-md border border-[#d5dbd0] bg-[#f6f7f4] px-3 text-sm font-bold text-[#4d574c] transition hover:bg-[#e9ede6] focus:outline-none focus:ring-2 focus:ring-[#22362b]"
            onClick={resetTypography}
            type="button"
          >
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            기본값으로 초기화
          </button>
        </section>
      ) : null}
    </div>
  );
}
