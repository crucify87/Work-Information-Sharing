"use client";

import {
  AlertTriangle,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Edit3,
  Search,
  Save,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  departments,
  isDateValue,
  logisticsTypes,
  normalizeStoredItems,
  priorities,
  statuses,
  WORK_ITEMS_STORAGE_KEY,
  workDepartments,
  type Department,
  type Priority,
  type Status,
  type WorkItem,
} from "../lib/work-items";
import {
  WORKBOARD_ACTIVE_DEPARTMENT_EVENT,
  WORKBOARD_DEPARTMENT_EVENT,
  WORKBOARD_ITEMS_EVENT,
} from "./MetricCards";

export type { WorkItem } from "../lib/work-items";

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

function formatDateLabel(dateValue: string) {
  const [, month, day] = dateValue.split("-");
  return `${Number(month)}/${Number(day)}`;
}

function formatLongDate(dateValue: string) {
  const [year, month, day] = dateValue.split("-");
  return `${year}년 ${Number(month)}월 ${Number(day)}일`;
}

function formatWon(amount: number) {
  return `${new Intl.NumberFormat("ko-KR").format(amount)}원`;
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
    const saved = window.localStorage.getItem(WORK_ITEMS_STORAGE_KEY);
    if (!saved) {
      return fallback;
    }
    const parsed = JSON.parse(saved);
    return normalizeStoredItems(parsed, fallback);
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
                  {item.receivableAmount ? (
                    <p className="mt-2 text-sm font-bold text-[#b4495f]">
                      미수금 {formatWon(item.receivableAmount)}
                    </p>
                  ) : null}
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
  const [formDepartment, setFormDepartment] =
    useState<WorkItem["department"]>("생산");
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
      try {
        window.localStorage.setItem(WORK_ITEMS_STORAGE_KEY, JSON.stringify(items));
      } catch {
        // Keep the current session usable when browser storage is unavailable.
      }
    }

    window.dispatchEvent(
      new CustomEvent(WORKBOARD_ITEMS_EVENT, { detail: items }),
    );
  }, [isReady, items]);

  useEffect(() => {
    const handleDepartment = (event: Event) => {
      const department = (event as CustomEvent<Department>).detail;
      if (departments.includes(department)) {
        setActiveDepartment(department);
      }
    };

    window.addEventListener(WORKBOARD_DEPARTMENT_EVENT, handleDepartment);
    return () =>
      window.removeEventListener(WORKBOARD_DEPARTMENT_EVENT, handleDepartment);
  }, []);

  useEffect(() => {
    window.dispatchEvent(
      new CustomEvent(WORKBOARD_ACTIVE_DEPARTMENT_EVENT, {
        detail: activeDepartment,
      }),
    );
  }, [activeDepartment]);

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
    const title = String(form.get("title") || "").trim().slice(0, 120);
    const department = String(
      form.get("department") || "생산",
    ) as WorkItem["department"];
    const owner =
      String(form.get("owner") || "").trim().slice(0, 40) || "담당자";
    const requestedDate = String(form.get("date") || "");
    const date = isDateValue(requestedDate) ? requestedDate : defaultDueDate;
    const due = formatDateLabel(date);
    const status = String(form.get("status") || "진행중") as Status;
    const logisticsType =
      department === "물류"
        ? (String(form.get("logisticsType") || "입고") as WorkItem["logisticsType"])
        : undefined;
    const amountValue = Number(form.get("receivableAmount") || 0);
    const receivableAmount =
      department === "회계" &&
      Number.isFinite(amountValue) &&
      amountValue > 0
        ? Math.round(amountValue)
        : undefined;

    if (!title) {
      return;
    }

    setItems((current) => {
      const nextId = Math.max(
        Date.now(),
        ...current.map((item) => item.id + 1),
      );
      return [
        {
          id: nextId,
          title,
          department,
          owner,
          date,
          due,
          status,
          priority: "보통",
          logisticsType,
          receivableAmount,
        },
        ...current,
      ];
    });
    event.currentTarget.reset();
    setFormDepartment("생산");
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
      title: editDraft.title.trim().slice(0, 120),
      owner: editDraft.owner.trim().slice(0, 40) || "담당자",
      date: getItemDate(editDraft),
      due: formatDateLabel(getItemDate(editDraft)),
      logisticsType:
        editDraft.department === "물류"
          ? editDraft.logisticsType ?? "입고"
          : undefined,
      receivableAmount:
        editDraft.department === "회계" &&
        Number.isFinite(editDraft.receivableAmount) &&
        Number(editDraft.receivableAmount) > 0
          ? Math.round(Number(editDraft.receivableAmount))
          : undefined,
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

  function deleteWorkItem(id: number) {
    setItems((current) => current.filter((item) => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setEditDraft(null);
    }
  }

  return (
    <>
      <MonthlyCalendar
        items={filteredItems}
        month={calendarMonth}
        onMonthChange={setCalendarMonth}
        selectedDate={selectedDate}
        onSelectDate={setSelectedDate}
      />

      <div
        className="scroll-mt-4 rounded-lg border border-[#d9ded4] bg-white shadow-sm"
        id="shared-work"
      >
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
              className="grid gap-3 p-4 transition hover:bg-[#fbfcf8] md:grid-cols-[minmax(0,1fr)_150px_130px_110px_160px]"
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
                  <div className="mt-2 grid gap-2">
                    <input
                      aria-label="업무명 수정"
                      className="h-10 w-full rounded-md border border-[#d5dbd0] px-3 text-sm font-semibold text-[#141914] outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
                      onChange={(event) =>
                        updateDraft("title", event.target.value)
                      }
                      maxLength={120}
                      value={editDraft.title}
                    />
                    {editDraft.department === "회계" ? (
                      <input
                        aria-label="미수금액 수정"
                        className="h-10 w-full rounded-md border border-[#e8cbd1] px-3 text-sm font-semibold text-[#8f3147] outline-none focus:border-[#b4495f] focus:ring-2 focus:ring-[#f2d9df]"
                        min="0"
                        onChange={(event) =>
                          updateDraft(
                            "receivableAmount",
                            Number(event.target.value) || undefined,
                          )
                        }
                        placeholder="미수금액"
                        step="1000"
                        type="number"
                        value={editDraft.receivableAmount ?? ""}
                      />
                    ) : null}
                    {editDraft.department === "물류" ? (
                      <select
                        aria-label="입출고 구분 수정"
                        className="h-10 w-full rounded-md border border-[#cbdced] bg-white px-3 text-sm font-semibold text-[#315f8f] outline-none focus:border-[#4079b5] focus:ring-2 focus:ring-[#dceafb]"
                        onChange={(event) =>
                          updateDraft(
                            "logisticsType",
                            event.target.value as WorkItem["logisticsType"],
                          )
                        }
                        value={editDraft.logisticsType ?? "입고"}
                      >
                        {logisticsTypes.map((type) => (
                          <option key={type}>{type}</option>
                        ))}
                      </select>
                    ) : null}
                  </div>
                ) : (
                  <>
                    <h3 className="mt-2 font-semibold text-[#141914]">
                      {item.title}
                    </h3>
                    {item.logisticsType ? (
                      <p className="mt-1 text-sm font-bold text-[#315f8f]">
                        {item.logisticsType} 업무
                      </p>
                    ) : null}
                    {item.receivableAmount ? (
                      <p className="mt-1 text-sm font-bold text-[#b4495f]">
                        미수금 {formatWon(item.receivableAmount)}
                      </p>
                    ) : null}
                  </>
                )}
              </div>
              <div className="flex items-center gap-2 text-sm text-[#5d685c]">
                <Users className="h-4 w-4" aria-hidden="true" />
                {isEditing ? (
                  <input
                    aria-label="담당자 수정"
                    className="h-9 min-w-0 rounded-md border border-[#d5dbd0] px-2 outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
                    onChange={(event) => updateDraft("owner", event.target.value)}
                    maxLength={40}
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
              <div className="flex min-w-[152px] flex-nowrap items-start gap-2 md:justify-end">
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
                  <>
                    <button
                      aria-label={`${item.title} 수정`}
                      className="inline-flex h-9 w-[72px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#eef1eb] px-2 text-xs font-bold leading-none text-[#4d574c] transition hover:bg-[#e0e5dc]"
                      onClick={() => startEdit(item)}
                      type="button"
                    >
                      <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="whitespace-nowrap break-keep">수정</span>
                    </button>
                    <button
                      aria-label={`${item.title} 삭제`}
                      className="inline-flex h-9 w-[72px] shrink-0 items-center justify-center gap-1.5 whitespace-nowrap rounded-md bg-[#fff2eb] px-2 text-xs font-bold leading-none text-[#b44923] transition hover:bg-[#ffe5d8]"
                      onClick={() => deleteWorkItem(item.id)}
                      type="button"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      <span className="whitespace-nowrap break-keep">삭제</span>
                    </button>
                  </>
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
        className={`grid min-w-0 gap-3 rounded-lg border border-[#d9ded4] bg-white p-4 shadow-sm sm:grid-cols-2 lg:grid-cols-3 2xl:gap-2 ${
          formDepartment === "회계" || formDepartment === "물류"
            ? "2xl:grid-cols-[minmax(140px,1fr)_80px_80px_140px_100px_110px_72px]"
            : "2xl:grid-cols-[minmax(140px,1fr)_90px_90px_140px_100px_72px]"
        }`}
        onSubmit={addWorkItem}
      >
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          새 업무
          <input
            className="h-10 w-full min-w-0 max-w-full rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="title"
            maxLength={120}
            placeholder="예: 금일 출고 지연 사유 공유"
            required
          />
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          부서
          <select
            className="h-10 w-full min-w-0 max-w-full rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="department"
            onChange={(event) =>
              setFormDepartment(event.target.value as WorkItem["department"])
            }
            value={formDepartment}
          >
            {workDepartments.map((department) => (
              <option key={department}>{department}</option>
            ))}
          </select>
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          담당자
          <input
            className="h-10 w-full min-w-0 max-w-full rounded-md border border-[#d5dbd0] px-3 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="owner"
            maxLength={40}
            placeholder="이름"
          />
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          마감
          <input
            className="h-10 w-full min-w-0 max-w-full rounded-md border border-[#d5dbd0] px-2 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            defaultValue={defaultDueDate}
            name="date"
            type="date"
          />
        </label>
        <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#4d574c]">
          상태
          <select
            className="h-10 w-full min-w-0 max-w-full rounded-md border border-[#d5dbd0] px-2 font-normal outline-none focus:border-[#22362b] focus:ring-2 focus:ring-[#c7d6c4]"
            name="status"
          >
            {statuses.map((status) => (
              <option key={status}>{status}</option>
            ))}
          </select>
        </label>
        {formDepartment === "회계" ? (
          <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#8f3147]">
            미수금액
            <input
              className="h-10 w-full min-w-0 max-w-full rounded-md border border-[#e8cbd1] px-2 font-normal text-[#141914] outline-none focus:border-[#b4495f] focus:ring-2 focus:ring-[#f2d9df]"
              inputMode="numeric"
              min="0"
              name="receivableAmount"
              placeholder="원 단위"
              step="1000"
              type="number"
            />
          </label>
        ) : null}
        {formDepartment === "물류" ? (
          <label className="grid min-w-0 gap-1 text-sm font-semibold text-[#315f8f]">
            입출고 구분
            <select
              className="h-10 w-full min-w-0 max-w-full rounded-md border border-[#cbdced] bg-white px-2 font-normal text-[#141914] outline-none focus:border-[#4079b5] focus:ring-2 focus:ring-[#dceafb]"
              name="logisticsType"
            >
              {logisticsTypes.map((type) => (
                <option key={type}>{type}</option>
              ))}
            </select>
          </label>
        ) : null}
        <button
          className="relative z-10 mt-auto inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-md bg-[#22362b] px-3 text-sm font-bold leading-none text-white transition hover:bg-[#314c3d] active:bg-[#17261e] focus:outline-none focus:ring-2 focus:ring-[#8ba394] focus:ring-offset-2 2xl:w-auto"
          type="submit"
        >
          <span className="whitespace-nowrap break-keep">등록</span>
        </button>
      </form>
    </>
  );
}
