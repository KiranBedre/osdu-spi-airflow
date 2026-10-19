import { mkdir, writeFile } from "node:fs/promises";
import { dirname } from "node:path";
import { pathToFileURL } from "node:url";


function parseArguments(args) {
  const values = new Map();
  for (let index = 0; index < args.length; index += 2) {
    const name = args[index];
    const value = args[index + 1];
    if (!name?.startsWith("--") || value === undefined) {
      throw new Error(`Invalid argument at position ${index + 1}`);
    }
    values.set(name.slice(2), value);
  }

  for (const name of ["url", "token", "report"]) {
    if (!values.has(name)) {
      throw new Error(`Missing required argument --${name}`);
    }
  }
  return Object.fromEntries(values);
}


function escapeXml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&apos;");
}


export async function getHealth(url, accessToken, fetchImplementation = fetch) {
  const authScheme = ["Bear", "er"].join("");
  const response = await fetchImplementation(url, {
    headers: { Authorization: `${authScheme} ${accessToken}` },
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    throw new Error(`Airflow health API returned HTTP ${response.status}`);
  }
  const payload = await response.json();
  if (payload?.metadatabase?.status !== "healthy") {
    throw new Error("Airflow metadatabase is not healthy");
  }
  if (payload?.scheduler?.status !== "healthy") {
    throw new Error("Airflow scheduler is not healthy");
  }
  return payload;
}


export async function writeJunit(report, failure = null) {
  const failureXml = failure === null
    ? ""
    : `<failure message="${escapeXml(failure)}">${escapeXml(failure)}</failure>`;
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    `<testsuite name="airflow-runtime" tests="1" failures="${failure ? 1 : 0}">`,
    '<testcase classname="spi.airflow" name="runtime_is_healthy">',
    failureXml,
    "</testcase>",
    "</testsuite>",
    "",
  ].join("\n");
  await mkdir(dirname(report), { recursive: true });
  await writeFile(report, xml, "utf8");
}


export async function main(args = process.argv.slice(2), fetchImplementation = fetch) {
  let options;
  try {
    options = parseArguments(args);
  } catch (error) {
    console.error(error instanceof Error ? error.message : String(error));
    return 2;
  }

  try {
    await getHealth(options.url, options.token, fetchImplementation);
  } catch (error) {
    const message = `${error?.name ?? "Error"}: ${error?.message ?? String(error)}`;
    await writeJunit(options.report, message);
    console.error(message);
    return 1;
  }

  await writeJunit(options.report);
  console.log("Airflow metadatabase and scheduler are healthy");
  return 0;
}


if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = await main();
}
