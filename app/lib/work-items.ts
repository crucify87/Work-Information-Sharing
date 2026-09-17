export const workDepartments = ["생산", "물류", "재고", "회계"] as const;
export type WorkDepartment = (typeof workDepartments)[number];

export const departments = ["전체", ...workDepartments] as const;
export type Department = (typeof departments)[number];

export const statuses = ["진행중", "확인필요", "완료"] as const;
export type Status = (typeof statuses)[number];

export const priorities = ["긴급", "보통", "낮음"] as const;
export type Priority = (typeof priorities)[number];

export type WorkItem = {
  id: number;
  title: string;
  department: WorkDepartment;
  owner: string;
  date?: string;
  due: string;
  status: Status;
  priority: Priority;
  receivableAmount?: number;
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

  return {
    id,
    title: title.slice(0, 120),
    department: value.department,
    owner,
    date,
    due,
    status: value.status,
    priority: value.priority,
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
