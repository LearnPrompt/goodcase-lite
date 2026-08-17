import "server-only";

import { readFileSync } from "node:fs";
import path from "node:path";
import {
  mergeCaseRetestEvidence,
  normalizeCaseRetestEvidence,
  parseCaseRetestEvidenceNotes,
  type CaseRetestEvidence,
} from "@/lib/case-retest-evidence-data";
import { getAdminSupabaseClient } from "@/lib/supabase/admin-client";

const MANIFEST_PATH = path.join(
  process.cwd(),
  "scripts",
  "retest",
  "eval-evidence-manifest.json"
);

type DatabaseRetestRow = {
  notes: string | null;
};

let manifestCache: CaseRetestEvidence[] | null = null;
let databasePromise: Promise<CaseRetestEvidence[]> | null = null;

function loadManifestEvidence() {
  if (manifestCache) return manifestCache;

  try {
    const parsed = JSON.parse(readFileSync(MANIFEST_PATH, "utf8")) as {
      records?: unknown[];
    };
    manifestCache = Array.isArray(parsed.records)
      ? parsed.records.flatMap((record) => {
          const normalized = normalizeCaseRetestEvidence(record);
          return normalized ? [normalized] : [];
        })
      : [];
  } catch {
    manifestCache = [];
  }

  return manifestCache;
}

async function loadDatabaseEvidence() {
  const supabase = getAdminSupabaseClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("case_retests")
    .select("notes")
    .order("tested_at", { ascending: false })
    .limit(2_000);

  if (error) {
    console.error("[case-retest-evidence] 读取 case_retests 失败，使用 manifest：", error);
    return [];
  }

  return ((data ?? []) as DatabaseRetestRow[]).flatMap((row) => {
    const evidence = parseCaseRetestEvidenceNotes(row.notes);
    return evidence ? [evidence] : [];
  });
}

function getDatabaseEvidence() {
  databasePromise ??= loadDatabaseEvidence();
  return databasePromise;
}

/**
 * 详情页公开复测证据。构建时 manifest 是稳定兜底；生产库有同 id 的记录时覆盖它，
 * 但任何读取故障都不会拖挂 Case 主体。
 */
export async function getCaseRetestEvidence(slug: string) {
  const manifest = loadManifestEvidence().filter((item) => item.slug === slug);
  const database = (await getDatabaseEvidence()).filter(
    (item) => item.slug === slug
  );
  return mergeCaseRetestEvidence(manifest, database);
}
