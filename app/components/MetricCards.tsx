"use client";

import { Calculator, Factory, Truck } from "lucide-react";
import { useEffect, useState } from "react";

export const WORKBOARD_DEPARTMENT_EVENT = "workboard:department";
export const WORKBOARD_ACTIVE_DEPARTMENT_EVENT = "workboard:active-department";

const metrics = [
  {
    label: "오늘 생산 달성률",
    value: "92%",
    detail: "전일 대비 +4%",
    department: "생산",
    icon: Factory,
    tone: "emerald",
  },
  {
    label: "입고/출고",
    value: "18건",
    detail: "입고 7건 · 출고 11건",
    department: "물류",
    icon: Truck,
    tone: "blue",
  },
  {
    label: "미수 확인",
    value: "₩24.8M",
    detail: "5개처 확인 필요",
    department: "회계",
    icon: Calculator,
    tone: "rose",
  },
] as const;

export function MetricCards() {
  const [activeDepartment, setActiveDepartment] = useState<string | null>(null);

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
