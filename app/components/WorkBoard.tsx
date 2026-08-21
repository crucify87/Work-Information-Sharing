"use client";

import {
  AlertTriangle,
  Clock3,
  Plus,
  Search,
  Users,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

export type Department = "전체" | "생산" | "물류" | "재고" | "회계";
type Status = "진행중" | "확인필요" | "완료";

export type WorkItem = {
  id: number;
  title: string;
  department: Exclude<Department, "전체">;
  owner: string;
  due: string;
  status: Status;
  priority: "긴급" | "보통" | "낮음";
};

const STORAGE_KEY = "business-work-hub-items";

const departments: Department[] = ["전체", "생산", "물류", "재고", "회계"];

const statusStyles: Record<Status, string> = {
  진행중: "bg-sky-50 text-sky-700 ring-sky-200",
  확인필요: "bg-amber-50 text-amber-800 ring-amber-200",
  완료: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

function readSavedItems(fallback: WorkItem[]) {
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (!saved) {
      return fallback;
    }
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? (parsed as WorkItem[]) : fallback;
  } catch {
    return fallback;
  }
}

export function WorkBoard({ initialItems }: { initialItems: WorkItem[] }) {
  const [activeDepartment, setActiveDepartment] = useState<Department>("전체");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(initialItems);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(readSavedItems(initialItems));
      setIsReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [initialItems]);

  useEffect(() => {
    if (isReady) {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [isReady, items]);

  const normalizedQuery = query.trim().toLowerCase();
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesDepartment =
        activeDepartment === "전체" || item.department === activeDepartment;
      const matchesQuery =
        normalizedQuery.length === 0 ||
        `${item.title} ${item.owner} ${item.department}`
          .toLowerCase()
          .includes(normalizedQuery);
      return matchesDepartment && matchesQuery;
    });
  }, [activeDepartment, items, normalizedQuery]);

  function addWorkItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const department = String(
      form.get("department") || "생산",
    ) as WorkItem["department"];
    const owner = String(form.get("owner") || "").trim() || "담당자";

    if (!title) {
      return;
    }

    setItems((current) => [
      {
        id: Date.now(),
        title,
        department,
        owner,
        due: "오늘",
        status: "진행중",
        priority: "보통",
      },
      ...current,
    ]);
    event.currentTarget.reset();
  }

  return (
    <>
      <div className="rounded-lg border border-[#d9ded4] bg-white shadow-sm">
        <div className="flex flex-col gap-4 border-b border-[#e5e9e0] p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold">공유 업무</h2>
              <p className="text-sm text-[#687266]">
                부서별 담당자와 마감 시간을 함께 확인합니다.
              </p>
            </div>
            <label className="relative block sm:w-72">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#768174]"
                aria-hidden="true"
              />
              <input
                className="h-10 w-full rounded-md border border-[#d5dbd0] bg-[#fbfcf8] pl-9 pr-3 text-sm outline-none transition focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
                onChange={(event) => setQuery(event.target.value)}
                placeholder="업무, 담당자 검색"
                type="search"
                value={query}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-2 text-sm sm:flex">
            {departments.map((department) => (
              <button
                key={department}
                aria-pressed={activeDepartment === department}
                className={`h-10 rounded-md px-4 font-semibold transition ${
                  activeDepartment === department
                    ? "bg-[#22362b] text-white"
                    : "bg-[#f6f7f4] text-[#4d574c] hover:bg-[#eef1eb]"
                }`}
                onClick={() => setActiveDepartment(department)}
                type="button"
              >
                {department}
              </button>
            ))}
          </div>
        </div>

        <div className="divide-y divide-[#e8ece5]">
          {filteredItems.map((item) => (
            <article
              className="grid gap-3 p-4 transition hover:bg-[#fbfcf8] md:grid-cols-[1fr_150px_130px_110px]"
              key={item.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-md bg-[#eef1eb] px-2 py-1 text-xs font-bold text-[#4d574c]">
                    {item.department}
                  </span>
                  {item.priority === "긴급" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#fff2eb] px-2 py-1 text-xs font-bold text-[#b44923]">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      긴급
                    </span>
                  )}
                </div>
                <h3 className="mt-2 font-semibold text-[#141914]">{item.title}</h3>
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5d685c]">
                <Users className="h-4 w-4" aria-hidden="true" />
                {item.owner}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5d685c]">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {item.due}
              </div>
              <div>
                <span
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[item.status]}`}
                >
                  {item.status}
                </span>
              </div>
            </article>
          ))}
          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-sm font-medium text-[#687266]">
              조건에 맞는 업무가 없습니다.
            </div>
          )}
        </div>
      </div>

      <form
        className="grid gap-3 rounded-lg border border-[#d9ded4] bg-white p-4 shadow-sm md:grid-cols-[1fr_140px_130px_auto]"
        onSubmit={addWorkItem}
      >
        <label className="grid gap-1 text-sm font-semibold text-[#4d574c]">
          새 업무
          <input
            className="h-10 rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="title"
            placeholder="예: 금일 출고 지연 사유 공유"
          />
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[#4d574c]">
          부서
          <select
            className="h-10 rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="department"
          >
            {departments.slice(1).map((department) => (
              <option key={department}>{department}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1 text-sm font-semibold text-[#4d574c]">
          담당자
          <input
            className="h-10 rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="owner"
            placeholder="이름"
          />
        </label>
        <button
          className="mt-auto inline-flex h-10 items-center justify-center gap-2 rounded-md bg-[#22362b] px-4 text-sm font-bold text-white transition hover:bg-[#314c3d]"
          type="submit"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          등록
        </button>
      </form>
    </>
  );
}
