"use client";

import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Plus,
  Search,
  Save,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

export type Department = "전체" | "생산" | "물류" | "재고" | "회계";
type Status = "진행중" | "확인필요" | "완료";
type Priority = "긴급" | "보통" | "낮음";

export type WorkItem = {
  id: number;
  title: string;
  department: Exclude<Department, "전체">;
  owner: string;
  date?: string;
  due: string;
  status: Status;
  priority: Priority;
};

const STORAGE_KEY = "business-work-hub-items";

const departments: Department[] = ["전체", "생산", "물류", "재고", "회계"];
const workDepartments: WorkItem["department"][] = ["생산", "물류", "재고", "회계"];
const statuses: Status[] = ["진행중", "확인필요", "완료"];
const priorities: Priority[] = ["긴급", "보통", "낮음"];

const statusStyles: Record<Status, string> = {
  진행중: "bg-sky-50 text-sky-700 ring-sky-200",
  확인필요: "bg-amber-50 text-amber-800 ring-amber-200",
  완료: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

const departmentStyles: Record<Exclude<Department, "전체">, string> = {
  생산: "bg-emerald-50 text-emerald-800 ring-emerald-200",
  물류: "bg-sky-50 text-sky-800 ring-sky-200",
  재고: "bg-amber-50 text-amber-800 ring-amber-200",
  회계: "bg-rose-50 text-rose-800 ring-rose-200",
};

const weekdayLabels = ["일", "월", "화", "수", "목", "금", "토"];

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function todayDateValue() {
  return toDateInputValue(new Date());
}

function isDateValue(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function formatDateLabel(dateValue: string) {
  const [, month, day] = dateValue.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function formatLongDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function getItemDate(item: Pick<WorkItem, "date">) {
  return isDateValue(item.date) ? item.date : todayDateValue();
}

function shiftMonth(monthValue: string, offset: number) {
  const [year, month] = monthValue.split("-").map(Number);
  const date = new Date(year, month - 1 + offset, 1);
  return toDateInputValue(date).slice(0, 7);
}

function getMonthLabel(monthValue: string) {
  const [year, month] = monthValue.split("-");
  return `${year}년 ${Number(month)}월`;
}

function buildCalendarDays(monthValue: string) {
  const [year, month] = monthValue.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1);
  const startDay = new Date(firstDay);
  startDay.setDate(firstDay.getDate() - firstDay.getDay());

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(startDay);
    date.setDate(startDay.getDate() + index);
    const value = toDateInputValue(date);

    return {
      value,
      day: date.getDate(),
      isCurrentMonth: value.startsWith(monthValue),
      isToday: value === todayDateValue(),
    };
  });
}

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

function MonthlyCalendar({
  items,
  month,
  onMonthChange,
  selectedDate,
  onSelectDate,
}: {
  items: WorkItem[];
  month: string;
  onMonthChange: (month: string) => void;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const calendarDays = useMemo(() => buildCalendarDays(month), [month]);
  const itemsByDate = useMemo(() => {
    return items.reduce<Record<string, WorkItem[]>>((groups, item) => {
      const date = getItemDate(item);
      groups[date] = groups[date] ? [...groups[date], item] : [item];
      return groups;
    }, {});
  }, [items]);

  const departmentCounts = useMemo(() => {
    return workDepartments.map((department) => ({
      department,
      count: items.filter((item) => item.department === department).length,
    }));
  }, [items]);
  const selectedItems = itemsByDate[selectedDate] ?? [];

  return (
    <section className="rounded-lg border border-[#d9ded4] bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-[#e5e9e0] p-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm font-semibold text-[#687266]">
            <CalendarDays className="h-4 w-4" aria-hidden="true" />
            월간 업무 대시보드
          </div>
          <h2 className="mt-1 text-lg font-semibold">{getMonthLabel(month)}</h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            aria-label="이전 달"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#eef1eb] text-[#4d574c] transition hover:bg-[#e0e5dc]"
            onClick={() => onMonthChange(shiftMonth(month, -1))}
            type="button"
          >
            <ChevronLeft className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            className="h-9 rounded-md bg-[#22362b] px-3 text-xs font-bold text-white transition hover:bg-[#314c3d]"
            onClick={() => onMonthChange(todayDateValue().slice(0, 7))}
            type="button"
          >
            이번 달
          </button>
          <button
            aria-label="다음 달"
            className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#eef1eb] text-[#4d574c] transition hover:bg-[#e0e5dc]"
            onClick={() => onMonthChange(shiftMonth(month, 1))}
            type="button"
          >
            <ChevronRight className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 border-b border-[#e5e9e0] px-4 py-3">
        {departmentCounts.map(({ department, count }) => (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold ring-1 ${departmentStyles[department]}`}
            key={department}
          >
            {department}
            <span className="font-semibold">{count}</span>
          </span>
        ))}
      </div>

      <div className="p-3">
        <div className="overflow-x-auto pb-2">
          <div className="min-w-[820px] md:min-w-0">
            <div className="grid grid-cols-7 gap-1 text-center text-sm font-bold text-[#687266]">
              {weekdayLabels.map((weekday) => (
                <div className="py-2" key={weekday}>
                  {weekday}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day) => {
                const dayItems = itemsByDate[day.value] ?? [];
                const isSelected = selectedDate === day.value;

                return (
                  <button
                    aria-label={`${formatLongDate(day.value)} 업무 ${dayItems.length}건 보기`}
                    aria-pressed={isSelected}
                    className={`min-h-32 rounded-md border p-2 text-left transition focus:outline-none focus:ring-2 focus:ring-[#22362b] sm:min-h-36 ${
                      day.isCurrentMonth
                        ? "border-[#e1e6dc] bg-[#fbfcf8] hover:bg-white"
                        : "border-[#eef1eb] bg-[#f6f7f4] text-[#9aa397]"
                    } ${isSelected ? "border-[#22362b] ring-2 ring-[#c7d6c4]" : ""}`}
                    key={day.value}
                    onClick={() => onSelectDate(day.value)}
                    type="button"
                  >
                    <div className="mb-1 flex items-center justify-between gap-2">
                      <span
                        className={`inline-flex h-7 min-w-7 items-center justify-center rounded-full px-2 text-sm font-bold ${
                          day.isToday ? "bg-[#22362b] text-white" : ""
                        }`}
                      >
                        {day.day}
                      </span>
                      {dayItems.length > 0 && (
                        <span className="rounded-full bg-[#22362b] px-2 py-0.5 text-xs font-bold text-white">
                          {dayItems.length}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      {dayItems.slice(0, 3).map((item) => (
                        <div
                          className={`rounded-md px-2 py-1 text-left ring-1 ${departmentStyles[item.department]}`}
                          key={item.id}
                          title={`${item.department} - ${item.title}`}
                        >
                          <p className="truncate text-xs font-bold leading-4">
                            {item.department}
                          </p>
                          <p className="truncate text-xs font-semibold leading-5">
                            {item.title}
                          </p>
                        </div>
                      ))}
                      {dayItems.length > 3 && (
                        <p className="text-xs font-bold text-[#687266]">
                          +{dayItems.length - 3}건 더 보기
                        </p>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-lg border border-[#e1e6dc] bg-[#fbfcf8] p-3">
          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <h3 className="text-base font-semibold">
              {formatLongDate(selectedDate)} 등록 내역
            </h3>
            <span className="text-sm font-bold text-[#687266]">
              총 {selectedItems.length}건
            </span>
          </div>

          {selectedItems.length > 0 ? (
            <div className="mt-3 grid gap-2">
              {selectedItems.map((item) => (
                <article
                  className="rounded-md border border-[#e1e6dc] bg-white p-3"
                  key={item.id}
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${departmentStyles[item.department]}`}
                    >
                      {item.department}
                    </span>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${statusStyles[item.status]}`}
                    >
                      {item.status}
                    </span>
                    <span className="ml-auto text-sm font-semibold text-[#687266]">
                      {item.owner}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-[#141914]">
                    {item.title}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <p className="mt-3 rounded-md bg-white p-4 text-sm font-medium text-[#687266]">
              이 날짜에 등록된 업무가 없습니다.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function WorkBoard({ initialItems }: { initialItems: WorkItem[] }) {
  const [activeDepartment, setActiveDepartment] = useState<Department>("전체");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(initialItems);
  const [calendarMonth, setCalendarMonth] = useState(() =>
    todayDateValue().slice(0, 7),
  );
  const [selectedDate, setSelectedDate] = useState(() => todayDateValue());
  const [isReady, setIsReady] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editDraft, setEditDraft] = useState<WorkItem | null>(null);
  const defaultDueDate = todayDateValue();

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
    const date = String(form.get("date") || defaultDueDate);
    const due = formatDateLabel(date);
    const status = String(form.get("status") || "진행중") as Status;

    if (!title) {
      return;
    }

    setItems((current) => [
      {
        id: Date.now(),
        title,
        department,
        owner,
        date,
        due,
        status,
        priority: "보통",
      },
      ...current,
    ]);
    event.currentTarget.reset();
  }

  function startEdit(item: WorkItem) {
    setEditingId(item.id);
    setEditDraft({ ...item });
  }

  function updateDraft<K extends keyof WorkItem>(key: K, value: WorkItem[K]) {
    setEditDraft((current) => (current ? { ...current, [key]: value } : current));
  }

  function saveEdit() {
    if (!editDraft || !editDraft.title.trim()) {
      return;
    }

    const updatedItem = {
      ...editDraft,
      title: editDraft.title.trim(),
      owner: editDraft.owner.trim() || "담당자",
      date: getItemDate(editDraft),
      due: formatDateLabel(getItemDate(editDraft)),
    };

    setItems((current) =>
      current.map((item) => (item.id === updatedItem.id ? updatedItem : item)),
    );
    setEditingId(null);
    setEditDraft(null);
  }

  function cancelEdit() {
    setEditingId(null);
    setEditDraft(null);
  }

  return (
    <>
      <MonthlyCalendar
        items={items}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

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
          {filteredItems.map((item) => {
            const isEditing = editingId === item.id && editDraft;

            return (
            <article
              className="grid gap-3 p-4 transition hover:bg-[#fbfcf8] md:grid-cols-[1fr_150px_130px_110px_110px]"
              key={item.id}
            >
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  {isEditing ? (
                    <select
                      aria-label="부서 수정"
                      className="h-8 rounded-md border border-[#d5dbd0] bg-white px-2 text-xs font-bold text-[#4d574c] outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
                      onChange={(event) =>
                        updateDraft(
                          "department",
                          event.target.value as WorkItem["department"],
                        )
                      }
                      value={editDraft.department}
                    >
                      {workDepartments.map((department) => (
                        <option key={department}>{department}</option>
                      ))}
                    </select>
                  ) : (
                    <span className="rounded-md bg-[#eef1eb] px-2 py-1 text-xs font-bold text-[#4d574c]">
                      {item.department}
                    </span>
                  )}
                  {(isEditing ? editDraft.priority : item.priority) === "긴급" && (
                    <span className="inline-flex items-center gap-1 rounded-md bg-[#fff2eb] px-2 py-1 text-xs font-bold text-[#b44923]">
                      <AlertTriangle className="h-3.5 w-3.5" aria-hidden="true" />
                      긴급
                    </span>
                  )}
                </div>
                {isEditing ? (
                  <input
                    aria-label="업무명 수정"
                    className="mt-2 h-10 w-full rounded-md border border-[#d5dbd0] px-3 text-sm font-semibold text-[#141914] outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
                    onChange={(event) => updateDraft("title", event.target.value)}
                    value={editDraft.title}
                  />
                ) : (
                  <h3 className="mt-2 font-semibold text-[#141914]">{item.title}</h3>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5d685c]">
                <Users className="h-4 w-4" aria-hidden="true" />
                {isEditing ? (
                  <input
                    aria-label="담당자 수정"
                    className="h-9 min-w-0 rounded-md border border-[#d5dbd0] px-2 outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
                    onChange={(event) => updateDraft("owner", event.target.value)}
                    value={editDraft.owner}
                  />
                ) : (
                  item.owner
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5d685c]">
                <Clock3 className="h-4 w-4" aria-hidden="true" />
                {isEditing ? (
                  <input
                    aria-label="마감 수정"
                    className="h-9 min-w-0 rounded-md border border-[#d5dbd0] px-2 outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
                    onChange={(event) => {
                      const nextDate = event.target.value || todayDateValue();
                      updateDraft("date", nextDate);
                      updateDraft("due", formatDateLabel(nextDate));
                    }}
                    type="date"
                    value={getItemDate(editDraft)}
                  />
                ) : (
                  item.due
                )}
              </div>
              <div>
                {isEditing ? (
                  <div className="grid gap-2">
                    <select
                      aria-label="상태 수정"
                      className="h-9 rounded-md border border-[#d5dbd0] bg-white px-2 text-sm outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
                      onChange={(event) =>
                        updateDraft("status", event.target.value as Status)
                      }
                      value={editDraft.status}
                    >
                      {statuses.map((status) => (
                        <option key={status}>{status}</option>
                      ))}
                    </select>
                    <select
                      aria-label="우선순위 수정"
                      className="h-9 rounded-md border border-[#d5dbd0] bg-white px-2 text-sm outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
                      onChange={(event) =>
                        updateDraft("priority", event.target.value as Priority)
                      }
                      value={editDraft.priority}
                    >
                      {priorities.map((priority) => (
                        <option key={priority}>{priority}</option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-bold ring-1 ${statusStyles[item.status]}`}
                  >
                    {item.status}
                  </span>
                )}
              </div>
              <div className="flex items-start gap-2 md:justify-end">
                {isEditing ? (
                  <>
                    <button
                      aria-label="업무 수정 저장"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#22362b] text-white transition hover:bg-[#314c3d]"
                      onClick={saveEdit}
                      type="button"
                    >
                      <Save className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button
                      aria-label="업무 수정 취소"
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-[#eef1eb] text-[#4d574c] transition hover:bg-[#e0e5dc]"
                      onClick={cancelEdit}
                      type="button"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </>
                ) : (
                  <button
                    aria-label={`${item.title} 수정`}
                    className="inline-flex h-9 items-center justify-center gap-2 rounded-md bg-[#eef1eb] px-3 text-sm font-bold text-[#4d574c] transition hover:bg-[#e0e5dc]"
                    onClick={() => startEdit(item)}
                    type="button"
                  >
                    <Edit3 className="h-4 w-4" aria-hidden="true" />
                    수정
                  </button>
                )}
              </div>
            </article>
            );
          })}
          {filteredItems.length === 0 && (
            <div className="p-8 text-center text-sm font-medium text-[#687266]">
              조건에 맞는 업무가 없습니다.
            </div>
          )}
        </div>
      </div>

      <form
        className="grid gap-3 rounded-lg border border-[#d9ded4] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-[minmax(220px,1fr)_110px_110px_130px_110px_86px]"
        onSubmit={addWorkItem}
      >
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          새 업무
          <input
            className="h-10 w-full rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="title"
            placeholder="예: 금일 출고 지연 사유 공유"
          />
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          부서
          <select
            className="h-10 w-full rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="department"
          >
            {workDepartments.map((department) => (
              <option key={department}>{department}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          담당자
          <input
            className="h-10 w-full rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="owner"
            placeholder="이름"
          />
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          마감
          <input
            className="h-10 w-full rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            defaultValue={defaultDueDate}
            name="date"
            type="date"
          />
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          상태
          <select
            className="h-10 w-full rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="status"
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        <button
          className="mt-auto inline-flex h-10 w-full items-center justify-center gap-1.5 rounded-md bg-[#22362b] px-3 text-xs font-bold text-white transition hover:bg-[#314c3d] 2xl:w-auto"
          type="submit"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          <span className="whitespace-nowrap">등록</span>
        </button>
      </form>
    </>
  );
}
