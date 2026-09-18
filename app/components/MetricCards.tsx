"use client";

import { Calculator, Factory, Truck } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import {
  buildDashboardMetric,
  normalizeStoredItems,
  WORK_ITEMS_STORAGE_KEY,
  type WorkItem,
} from "../lib/work-items";

export const WORKBOARD_DEPARTMENT_EVENT = "workboard:department";
export const WORKBOARD_ACTIVE_DEPARTMENT_EVENT = "workboard:active-department";
export const WORKBOARD_ITEMS_EVENT = "workboard:items";

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatWon(amount: number) {
  return `₩${new Intl.NumberFormat("ko-KR").format(amount)}`;
}

function readSavedItems(fallback: WorkItem[]) {
  try {
    const saved = window.localStorage.getItem(WORK_ITEMS_STORAGE_KEY);
    if (!saved) {
      return fallback;
    }
    return normalizeStoredItems(JSON.parse(saved), fallback);
  } catch {
    return fallback;
  }
}

const metricMeta = [
  {
    label: "오늘 생산 달성률",
    department: "생산",
    icon: Factory,
    tone: "emerald",
  },
  {
    label: "입고/출고",
    department: "물류",
    icon: Truck,
    tone: "blue",
  },
  {
    label: "미수 확인",
    department: "회계",
    icon: Calculator,
    tone: "rose",
  },
] as const;

export function MetricCards({ initialItems }: { initialItems: WorkItem[] }) {
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);
  const [items, setItems] = useState(initialItems);

  useEffect(() => {
    const handleActiveDepartment = (event: Event) => {
      setActiveDepartment((event as CustomEvent<string>).detail);
    };

    window.addEventListener(
      WORKBOARD_ACTIVE_DEPARTMENT_EVENT,
      handleActiveDepartment,
    );
    return () =>
      window.removeEventListener(
        WORKBOARD_ACTIVE_DEPARTMENT_EVENT,
        handleActiveDepartment,
      );
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setItems(readSavedItems(initialItems));
    }, 0);

    const handleItems = (event: Event) => {
      setItems((event as CustomEvent<WorkItem[]>).detail);
    };

    window.addEventListener(WORKBOARD_ITEMS_EVENT, handleItems);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener(WORKBOARD_ITEMS_EVENT, handleItems);
    };
  }, [initialItems]);

  const metrics = useMemo(() => {
    const dashboardMetric = buildDashboardMetric(
      items,
      toDateInputValue(new Date()),
    );
    const logisticsTotal =
      dashboardMetric.inboundCount + dashboardMetric.outboundCount;

    return metricMeta.map((metric) => {
      if (metric.department === "생산") {
        return {
          ...metric,
          value: `${dashboardMetric.productionRate}%`,
          detail: `완료 ${dashboardMetric.productionCompleted}건 / 전체 ${dashboardMetric.productionTotal}건`,
        };
      }
      if (metric.department === "물류") {
        return {
          ...metric,
          value: `${logisticsTotal}건`,
          detail: `입고 ${dashboardMetric.inboundCount}건 · 출고 ${dashboardMetric.outboundCount}건`,
        };
      }
      return {
        ...metric,
        value: formatWon(dashboardMetric.receivableAmount),
        detail: `${dashboardMetric.receivableCount}개처 확인 필요`,
      };
    });
  }, [items]);

  function openDepartment(department: string) {
    setActiveDepartment(department);
    window.dispatchEvent(
      new CustomEvent(WORKBOARD_DEPARTMENT_EVENT, { detail: department }),
    );
    window.requestAnimationFrame(() => {
      document
        .getElementById("shared-work")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const isActive = activeDepartment === metric.department;

        return (
          <button
            aria-pressed={isActive}
            className={`rounded-lg border bg-white p-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-[#9eaa9c] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-[#22362b] ${
              isActive
                ? "border-[#22362b] ring-2 ring-[#c7d6c4]"
                : "border-[#d9ded4]"
            }`}
            key={metric.label}
            onClick={() => openDepartment(metric.department)}
            type="button"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#687266]">
                  {metric.label}
                </p>
                <p className="mt-2 text-2xl font-semibold">{metric.value}</p>
              </div>
              <span className={`metric-icon ${metric.tone}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-sm font-semibold text-[#526152]">
              {metric.detail}
            </p>
            <p className="mt-3 text-xs font-bold text-[#687266]">
              {metric.department} 업무 보기
            </p>
          </button>
        );
      })}
    </div>
  );
}
