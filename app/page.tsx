import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  Factory,
  FileText,
  Filter,
  RefreshCw,
  ShieldCheck,
  Truck,
  Warehouse,
} from "lucide-react";
import { WorkBoard, type WorkItem } from "./components/WorkBoard";

const initialWorkItems: WorkItem[] = [
  {
    id: 1,
    title: "2라인 포장 설비 점검 결과 공유",
    department: "생산",
    owner: "김현장",
    date: "2026-09-16",
    due: "오늘 15:00",
    status: "확인필요",
    priority: "긴급",
  },
  {
    id: 2,
    title: "부산 거래처 긴급 출고 차량 배차",
    department: "물류",
    owner: "박배송",
    date: "2026-09-16",
    due: "오늘 17:30",
    status: "진행중",
    priority: "긴급",
  },
  {
    id: 3,
    title: "A-104 원자재 안전재고 미달 확인",
    department: "재고",
    owner: "이재고",
    date: "2026-09-17",
    due: "내일 09:00",
    status: "진행중",
    priority: "보통",
  },
  {
    id: 4,
    title: "7월 매입 세금계산서 누락분 정리",
    department: "회계",
    owner: "최정산",
    date: "2026-09-17",
    due: "내일 12:00",
    status: "확인필요",
    priority: "보통",
  },
  {
    id: 5,
    title: "주간 완제품 생산량 보고서 마감",
    department: "생산",
    owner: "정품질",
    date: "2026-09-18",
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

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f6f7f4] text-[#1c201c]">
      <section className="border-b border-[#d9ded4] bg-[#fbfcf8]">
        <div className="mx-auto flex max-w-7xl flex-col gap-6 px-5 py-6 lg:px-8">
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#687266]">
              <Building2 className="h-4 w-4" aria-hidden="true" />
              work-information-sharing
            </div>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-normal text-[#111611] sm:text-4xl">
              work-information-sharing
            </h1>
            <p className="max-w-2xl text-sm font-medium text-[#687266] sm:text-base">
              부서별 업무, 인계, 재고 경보, 정산 확인 사항을 한 곳에 모아
              마감 전에 놓치는 일을 줄입니다.
            </p>
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
                      <p className="mt-2 text-2xl font-semibold">
                        {metric.value}
                      </p>
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
          <WorkBoard initialItems={initialWorkItems} />
        </div>

        <aside className="space-y-5">
          <section className="rounded-lg border border-[#d9ded4] bg-white p-4 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">부서 인계</h2>
              <Filter className="h-4 w-4 text-[#687266]" aria-hidden="true" />
            </div>
            <div className="space-y-3">
              {handoffs.map((handoff) => (
                <article
                  className="rounded-lg bg-[#f6f7f4] p-3"
                  key={handoff.title}
                >
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

          <section className="rounded-lg border border-[#d9ded4] bg-[#22362b] p-4 text-white shadow-sm">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" aria-hidden="true" />
              <h2 className="text-lg font-semibold">오늘 마감 체크</h2>
            </div>
            <div className="mt-4 space-y-3 text-sm">
              <p className="flex items-center gap-2">
                <CheckCircle2
                  className="h-4 w-4 text-[#a8dfb0]"
                  aria-hidden="true"
                />
                생산 실적 입력 완료
              </p>
              <p className="flex items-center gap-2">
                <RefreshCw
                  className="h-4 w-4 text-[#ffd08a]"
                  aria-hidden="true"
                />
                운송장 번호 6건 대기
              </p>
              <p className="flex items-center gap-2">
                <FileText
                  className="h-4 w-4 text-[#ffd08a]"
                  aria-hidden="true"
                />
                회계 승인 요청 3건
              </p>
            </div>
          </section>
        </aside>
      </section>
    </main>
  );
}
