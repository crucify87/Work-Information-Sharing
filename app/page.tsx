"use client";

import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  Building2,
  Calculator,
  CheckCircle2,
  Clock3,
  Factory,
  FileText,
  Filter,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Truck,
  Users,
  Warehouse,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

type Department = "전체" | "생산" | "물류" | "재고" | "회계";
type Status = "진행중" | "확인필요" | "완료";

type WorkItem = {
  id: number;
  title: string;
  department: Exclude<Department, "전체">;
  owner: string;
  due: string;
  status: Status;
  priority: "긴급" | "보통" | "낮음";
};

const departments: Department[] = ["전체", "생산", "물류", "재고", "회계"];

const initialWorkItems: WorkItem[] = [
  {
    id: 1,
    title: "2라인 포장 설비 점검 결과 공유",
    department: "생산",
    owner: "김현장",
    due: "오늘 15:00",
    status: "확인필요",
    priority: "긴급",
  },
  {
    id: 2,
    title: "부산 거래처 긴급 출고 차량 배차",
    department: "물류",
    owner: "박배송",
    due: "오늘 17:30",
    status: "진행중",
    priority: "긴급",
  },
  {
    id: 3,
    title: "A-104 원자재 안전재고 미달 확인",
    department: "재고",
    owner: "이재고",
    due: "내일 09:00",
    status: "진행중",
    priority: "보통",
  },
  {
    id: 4,
    title: "7월 매입 세금계산서 누락분 정리",
    department: "회계",
    owner: "최정산",
    due: "내일 12:00",
    status: "확인필요",
    priority: "보통",
  },
  {
    id: 5,
    title: "주간 완제품 생산량 보고서 마감",
    department: "생산",
    owner: "정품질",
    due: "금요일",
    status: "완료",
    priority: "낮음",
  },
];

const metrics = [
  {
    label: "오늘 생산 달성률",
    value: "92%",
    trend: "+4%",
    icon: Factory,
    tone: "emerald",
  },
  {
    label: "출고 대기 건",
    value: "18",
    trend: "-3건",
    icon: Truck,
    tone: "blue",
  },
  {
    label: "안전재고 미달",
    value: "7",
    trend: "+2건",
    icon: Warehouse,
    tone: "amber",
  },
  {
    label: "미수 확인 필요",
    value: "₩24.8M",
    trend: "5개처",
    icon: Calculator,
    tone: "rose",
  },
];

const handoffs = [
  {
    from: "생산",
    to: "재고",
    title: "완제품 B-220 입고 예정 수량 1,240EA",
    time: "10분 전",
  },
  {
    from: "재고",
    to: "물류",
    title: "냉장 창고 C구역 피킹 우선순위 변경",
    time: "24분 전",
  },
  {
    from: "물류",
    to: "회계",
    title: "직납 운임 추가 비용 승인 요청",
    time: "41분 전",
  },
];

const inventoryAlerts = [
  { item: "A-104 원자재", stock: "2.1일분", note: "발주 승인 필요" },
  { item: "B-018 포장재", stock: "3.4일분", note: "금일 입고 예정" },
  { item: "C-771 완제품", stock: "과잉 18%", note: "출고 계획 조정" },
];

const statusStyles: Record<Status, string> = {
  진행중: "bg-sky-50 text-sky-700 ring-sky-200",
  확인필요: "bg-amber-50 text-amber-800 ring-amber-200",
  완료: "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export default function Home() {
  const [activeDepartment, setActiveDepartment] = useState<Department>("전체");
  const [query, setQuery] = useState("");
  const [items, setItems] = useState(initialWorkItems);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchesDepartment =
        activeDepartment === "전체" || item.department === activeDepartment;
      const matchesQuery = `${item.title} ${item.owner} ${item.department}`
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      return matchesDepartment && matchesQuery;
    });
  }, [activeDepartment, items, query]);

  function addWorkItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const title = String(form.get("title") || "").trim();
    const department = String(form.get("department") || "생산") as WorkItem["department"];
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
    <main className="min-h-screen bg-[#f6f7f4] text-[#1c201c]">
      <section className="border-b border-[#d9ded4] bg-[#fbfcf8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-[#687266]">
                <Building2 className="h-4 w-4" aria-hidden="true" />
                통합 업무공유
              </div>
              <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-[#111611] sm:text-4xl">
                생산, 물류, 재고, 회계가 같은 화면에서 오늘의 흐름을 맞춥니다
              </h1>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-lg border border-[#d9ded4] bg-white p-2 text-sm shadow-sm sm:flex">
              {departments.map((department) => (
                <button
                  key={department}
                  className={`h-10 rounded-md px-4 font-semibold transition ${
                    activeDepartment === department
                      ? "bg-[#22362b] text-white"
                      : "text-[#4d574c] hover:bg-[#eef1eb]"
                  }`}
                  onClick={() => setActiveDepartment(department)}
                  type="button"
                >
                  {department}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {metrics.map((metric) => {
              const Icon = metric.icon;
              return (
                <article
                  className="rounded-lg border border-[#d9ded4] bg-white p-4 shadow-sm"
                  key={metric.label}
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
                    전일 대비 {metric.trend}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-5 px-5 py-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:px-8">
        <div className="space-y-5">
          <div className="rounded-lg border border-[#d9ded4] bg-white shadow-sm">
            <div className="flex flex-col gap-3 border-b border-[#e5e9e0] p-4 sm:flex-row sm:items-center sm:justify-between">
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
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-[#d9ded4] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">부서 인계</h2>
              <Filter className="h-4 w-4 text-[#687266]" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              {handoffs.map((handoff) => (
                <article className="rounded-lg bg-[#f6f7f4] p-3" key={handoff.title}>
                  <div className="mb-2 flex items-center gap-2 text-xs font-bold text-[#5d685c]">
                    {handoff.from}
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                    {handoff.to}
                    <span className="ml-auto font-medium">{handoff.time}</span>
                  </div>
                  <p className="text-sm font-semibold">{handoff.title}</p>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#d9ded4] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">재고 알림</h2>
              <Boxes className="h-4 w-4 text-[#687266]" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              {inventoryAlerts.map((alert) => (
                <article
                  className="grid grid-cols-[1fr_auto] gap-2 border-b border-[#e8ece5] pb-3 last:border-0 last:pb-0"
                  key={alert.item}
                >
                  <div>
                    <p className="text-sm font-semibold">{alert.item}</p>
                    <p className="mt-1 text-xs text-[#687266]">{alert.note}</p>
                  </div>
                  <span className="text-sm font-bold text-[#b44923]">{alert.stock}</span>
                </article>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-[#d9ded4] bg-[#22362b] p-4 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-lg font-semibold">오늘 마감 체크</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-[#a8dfb0]" aria-hidden="true" />
                생산 실적 입력 완료
              </p>
              <p className="flex items-center gap-2">
                <RefreshCw className="h-4 w-4 text-[#ffd08a]" aria-hidden="true" />
                운송장 번호 6건 대기
              </p>
              <p className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-[#ffd08a]" aria-hidden="true" />
                회계 승인 요청 3건
              </p>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
