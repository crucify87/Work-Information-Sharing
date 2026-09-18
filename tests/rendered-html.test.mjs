import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

async function render() {
  const workerUrl = new URL("../dist/server/index.js", import.meta.url);
  workerUrl.searchParams.set("test", `${process.pid}-${Date.now()}`);
  const { default: worker } = await import(workerUrl.href);

  return worker.fetch(
    new Request("http://localhost/", {
      headers: { accept: "text/html" },
    }),
    {
      ASSETS: {
        fetch: async () => new Response("Not found", { status: 404 }),
      },
    },
    {
      waitUntil() {},
      passThroughOnException() {},
    },
  );
}

test("server-renders the current work-sharing app", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);

  const html = await response.text();
  assert.match(html, /<title>work-information-sharing<\/title>/i);
  assert.match(html, /오늘 생산 달성률/);
  assert.match(html, /입고\/출고/);
  assert.match(html, /미수 확인/);
  assert.match(html, /월간 업무 대시보드/);
  assert.match(html, /공유 업무/);
  assert.doesNotMatch(html, /<p class="text-sm font-medium text-\[#687266\]">안전재고 미달<\/p>/);
  assert.doesNotMatch(html, /Your site is taking shape|Building your site/);
});

test("normalizes malformed browser data without losing valid work", async () => {
  const { normalizeStoredItems } = await import(
    new URL("../app/lib/work-items.ts", import.meta.url)
  );
  const fallback = [
    {
      id: 99,
      title: "기본 업무",
      department: "생산",
      owner: "담당자",
      due: "9/17",
      status: "진행중",
      priority: "보통",
    },
  ];
  const normalized = normalizeStoredItems(
    [
      {
        id: 1,
        title: "  미수 확인  ",
        department: "회계",
        owner: "",
        date: "not-a-date",
        due: "",
        status: "확인필요",
        priority: "긴급",
        receivableAmount: "120000",
      },
      { id: 1, title: "중복", department: "생산" },
      null,
    ],
    fallback,
  );

  assert.deepEqual(normalized, [
    {
      id: 1,
      title: "미수 확인",
      department: "회계",
      owner: "담당자",
      date: undefined,
      due: "미정",
      status: "확인필요",
      priority: "긴급",
      receivableAmount: 120000,
    },
  ]);
  assert.deepEqual(normalizeStoredItems({ broken: true }, fallback), fallback);
  assert.deepEqual(normalizeStoredItems([], fallback), []);
});

test("builds dashboard metrics from department work items", async () => {
  const { buildDashboardMetric } = await import(
    new URL("../app/lib/work-items.ts", import.meta.url)
  );

  const metric = buildDashboardMetric(
    [
      {
        id: 1,
        title: "오전 생산 완료",
        department: "생산",
        owner: "담당자",
        date: "2026-09-18",
        due: "오늘",
        status: "완료",
        priority: "보통",
      },
      {
        id: 2,
        title: "오후 생산 확인",
        department: "생산",
        owner: "담당자",
        date: "2026-09-18",
        due: "오늘",
        status: "진행중",
        priority: "보통",
      },
      {
        id: 3,
        title: "제품 입고 검수",
        department: "물류",
        owner: "담당자",
        due: "오늘",
        status: "진행중",
        priority: "보통",
        logisticsType: "입고",
      },
      {
        id: 4,
        title: "거래처 출고 차량 배차",
        department: "물류",
        owner: "담당자",
        due: "오늘",
        status: "진행중",
        priority: "보통",
        logisticsType: "출고",
      },
      {
        id: 5,
        title: "거래처 미수금 확인",
        department: "회계",
        owner: "담당자",
        due: "오늘",
        status: "확인필요",
        priority: "긴급",
        receivableAmount: 120000,
      },
    ],
    "2026-09-18",
  );

  assert.deepEqual(metric, {
    productionRate: 50,
    productionCompleted: 1,
    productionTotal: 2,
    inboundCount: 1,
    outboundCount: 1,
    receivableAmount: 120000,
    receivableCount: 1,
  });
});

test("keeps Cloudflare deployment deterministic", async () => {
  const config = JSON.parse(
    await readFile(new URL("../wrangler.jsonc", import.meta.url), "utf8"),
  );

  assert.equal(config.main, "dist/server/index.js");
  assert.equal(config.assets.directory, "dist/client");
  assert.deepEqual(config.compatibility_flags, ["nodejs_compat"]);
  assert.equal("build" in config, false);
});
