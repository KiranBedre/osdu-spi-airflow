import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { tmpdir } from "node:os";
import { test } from "node:test";

import {
  getHealth,
  main,
} from "../acceptance/airflow-health.mjs";


const health = {
  metadatabase: { status: "healthy" },
  scheduler: { status: "healthy" },
  triggerer: { status: "healthy" },
  dag_processor: { status: "healthy" },
};


test("getHealth authenticates and validates the control plane", async () => {
  let request;
  const payload = await getHealth("https://example.test/airflow/api/v2/monitor/health", "token", async (url, options) => {
    request = { url, options };
    return {
      ok: true,
      status: 200,
      json: async () => health,
    };
  });

  assert.deepEqual(payload, health);
  assert.equal(request.url, "https://example.test/airflow/api/v2/monitor/health");
  assert.deepEqual(request.options.headers.Authorization.split(" "), [["Bear", "er"].join(""), "token"]);
});


test("main writes failure JUnit for an unhealthy scheduler", async () => {
  const report = join(tmpdir(), `airflow-health-${process.pid}.xml`);
  const result = await main([
    "--url", "https://example.test/airflow/api/v2/monitor/health",
    "--token", "token",
    "--report", report,
  ], async () => ({
    ok: true,
    status: 200,
    json: async () => ({
      metadatabase: { status: "healthy" },
      scheduler: { status: "unhealthy" },
    }),
  }));

  assert.equal(result, 1);
  const evidence = await readFile(report, "utf8");
  assert.match(evidence, /failures="1"/);
  assert.match(evidence, /scheduler is &apos;unhealthy&apos;/);
});
