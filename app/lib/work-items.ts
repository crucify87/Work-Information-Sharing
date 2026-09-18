export const workDepartments = ["생산", "물류", "재고", "회계"] as const;
export type WorkDepartment = (typeof workDepartments)[number];

export const departments = ["전체", ...workDepartments] as const;
export type Department = (typeof departments)[number];

export const statuses = ["진행중", "확인필요", "완료"] as const;
export type Status = (typeof statuses)[number];

export const priorities = ["긴급", "보통", "낮음"] as const;
export type Priority = (typeof priorities)[number];

export const logisticsTypes = ["입고", "출고"] as const;
export type LogisticsType = (typeof logisticsTypes)[number];

export type WorkItem = {
  id: number;
  title: string;
  department: WorkDepartment;
  owner: string;
  date?: string;
  due: string;
  status: Status;
  priority: Priority;
  logisticsType?: LogisticsType;
  receivableAmount?: number;
};

export const WORK_ITEMS_STORAGE_KEY = "business-work-hub-items";

export type DashboardMetric = {
  productionRate: number;
  productionCompleted: number;
  productionTotal: number;
  inboundCount: number;
  outboundCount: number;
  receivableAmount: number;
  receivableCount: number;
};

export function isDateValue(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function includesValue<T extends readonly string[]>(
  values: T,
  value: unknown,
): value is T[number] {
  return (
    typeof value === "string" &&
    (values as readonly string[]).includes(value)
  );
}

function normalizeWorkItem(value: unknown): WorkItem | null {
  if (!isRecord(value)) {
    return null;
  }

  const id = Number(value.id);
  const title = typeof value.title === "string" ? value.title.trim() : "";
  if (
    !Number.isSafeInteger(id) ||
    id <= 0 ||
    !title ||
    !includesValue(workDepartments, value.department) ||
    !includesValue(statuses, value.status) ||
    !includesValue(priorities, value.priority)
  ) {
    return null;
  }

  const owner =
    typeof value.owner === "string" && value.owner.trim()
      ? value.owner.trim().slice(0, 40)
      : "담당자";
  const date = isDateValue(value.date) ? value.date : undefined;
  const due =
    typeof value.due === "string" && value.due.trim()
      ? value.due.trim().slice(0, 30)
      : "미정";
  const amount = Number(value.receivableAmount);
  const receivableAmount =
    value.department === "회계" && Number.isFinite(amount) && amount > 0
      ? Math.round(amount)
      : undefined;
  const logisticsType =
    value.department === "물류"
      ? includesValue(logisticsTypes, value.logisticsType)
        ? value.logisticsType
        : title.includes("입고")
          ? "입고"
          : title.includes("출고")
            ? "출고"
            : undefined
      : undefined;

  return {
    id,
    title: title.slice(0, 120),
    department: value.department,
    owner,
    date,
    due,
    status: value.status,
    priority: value.priority,
    ...(logisticsType ? { logisticsType } : {}),
    receivableAmount,
  };
}

export function normalizeStoredItems(
  value: unknown,
  fallback: WorkItem[],
): WorkItem[] {
  if (!Array.isArray(value)) {
    return fallback;
  }
  if (value.length === 0) {
    return [];
  }

  const seenIds = new Set<number>();
  const normalized = value.flatMap((entry) => {
    const item = normalizeWorkItem(entry);
    if (!item || seenIds.has(item.id)) {
      return [];
    }
    seenIds.add(item.id);
    return [item];
  });

  return normalized.length > 0 ? normalized : fallback;
}

export function buildDashboardMetric(
  items: WorkItem[],
  today: string,
): DashboardMetric {
  const productionItems = items.filter(
    (item) => item.department === "생산" && item.date === today,
  );
  const productionCompleted = productionItems.filter(
    (item) => item.status === "완료",
  ).length;
  const productionTotal = productionItems.length;
  const productionRate =
    productionTotal > 0
      ? Math.round((productionCompleted / productionTotal) * 100)
      : 0;

  const logisticsItems = items.filter((item) => item.department === "물류");
  const getLogisticsType = (item: WorkItem) =>
    item.logisticsType ??
    (item.title.includes("입고")
      ? "입고"
      : item.title.includes("출고")
        ? "출고"
        : undefined);
  const inboundCount = logisticsItems.filter(
    (item) => getLogisticsType(item) === "입고",
  ).length;
  const outboundCount = logisticsItems.filter(
    (item) => getLogisticsType(item) === "출고",
  ).length;

  const receivableItems = items.filter(
    (item) =>
      item.department === "회계" &&
      item.status !== "완료" &&
      Number(item.receivableAmount) > 0,
  );
  const receivableAmount = receivableItems.reduce(
    (sum, item) => sum + Number(item.receivableAmount ?? 0),
    0,
  );

  return {
    productionRate,
    productionCompleted,
    productionTotal,
    inboundCount,
    outboundCount,
    receivableAmount,
    receivableCount: receivableItems.length,
  };
}
