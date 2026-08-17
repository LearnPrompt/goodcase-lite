export const EVAL_EVIDENCE_SCHEMA = "goodcase-eval-evidence-v1";

export type RetestArtifactKind = "image" | "ui" | "video";
export type RetestStatus = "complete" | "failed";
export type RetestModelDisclosure =
  | "requested-model-unverified"
  | "provider-reported";

export type RetestArtifacts = {
  primary?: string;
  desktop?: string;
  mobile?: string;
  html?: string;
  video?: string;
};

export type RetestJudgeScore = {
  model: string;
  score: number;
};

export type CaseRetestEvidence = {
  id: string;
  runId: string;
  slug: string;
  testedAt: string;
  kind: RetestArtifactKind;
  status: RetestStatus;
  model: string;
  modelDisclosure: RetestModelDisclosure | null;
  artifacts: RetestArtifacts;
  finalScore: number | null;
  judges: RetestJudgeScore[];
  disagreement: number | null;
  automaticOnly: boolean;
  promptSha256: string | null;
  failureReason: string | null;
};

export type CaseRetestRunDisplay = {
  model: string;
  index: number;
  total: number;
};

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stringValue(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export function getCaseRetestDisplayModel(model: string) {
  return model === "Codex built-in image generation" ? "GPT Image 2" : model;
}

export function buildCaseRetestRunDisplays(
  records: readonly CaseRetestEvidence[]
) {
  const groups = new Map<string, CaseRetestEvidence[]>();

  for (const evidence of records) {
    const model = getCaseRetestDisplayModel(evidence.model);
    const key = `${evidence.kind}:${model.toLocaleLowerCase("en-US")}`;
    const group = groups.get(key) ?? [];
    group.push(evidence);
    groups.set(key, group);
  }

  const byId = new Map<string, CaseRetestRunDisplay>();
  for (const group of groups.values()) {
    const chronological = [...group].sort(
      (a, b) =>
        a.testedAt.localeCompare(b.testedAt) || a.id.localeCompare(b.id)
    );
    chronological.forEach((evidence, position) => {
      byId.set(evidence.id, {
        model: getCaseRetestDisplayModel(evidence.model),
        index: position + 1,
        total: chronological.length,
      });
    });
  }

  return byId;
}

function normalizeModelDisclosure(
  value: unknown
): RetestModelDisclosure | null {
  return value === "requested-model-unverified" ||
    value === "provider-reported"
    ? value
    : null;
}

function normalizeArtifacts(value: unknown): RetestArtifacts {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    ["primary", "desktop", "mobile", "html", "video"]
      .map((key) => [key, stringValue(value[key])])
      .filter((entry): entry is [string, string] => Boolean(entry[1]))
  );
}

function normalizeJudges(value: unknown): RetestJudgeScore[] {
  if (!Array.isArray(value)) return [];

  return value.flatMap((item) => {
    if (!isRecord(item)) return [];
    const model = stringValue(item.model);
    const score = finiteNumber(item.score);
    return model && score !== null ? [{ model, score }] : [];
  });
}

export function normalizeCaseRetestEvidence(
  value: unknown
): CaseRetestEvidence | null {
  if (!isRecord(value)) return null;

  const id = stringValue(value.id);
  const runId = stringValue(value.runId);
  const slug = stringValue(value.slug);
  const testedAt = stringValue(value.testedAt);
  const model = stringValue(value.model);
  const kind = value.kind;
  const status = value.status;

  if (
    !id ||
    !runId ||
    !slug ||
    !testedAt ||
    !model ||
    (kind !== "image" && kind !== "ui" && kind !== "video") ||
    (status !== "complete" && status !== "failed")
  ) {
    return null;
  }

  return {
    id,
    runId,
    slug,
    testedAt,
    kind,
    status,
    model,
    modelDisclosure: normalizeModelDisclosure(value.modelDisclosure),
    artifacts: normalizeArtifacts(value.artifacts),
    finalScore: finiteNumber(value.finalScore),
    judges: normalizeJudges(value.judges),
    disagreement: finiteNumber(value.disagreement),
    automaticOnly: value.automaticOnly === true,
    promptSha256: stringValue(value.promptSha256),
    failureReason: stringValue(value.failureReason),
  };
}

export function parseCaseRetestEvidenceNotes(
  notes: unknown
): CaseRetestEvidence | null {
  if (typeof notes !== "string" || !notes.trim()) return null;

  try {
    const parsed = JSON.parse(notes) as unknown;
    if (!isRecord(parsed) || parsed.schema !== EVAL_EVIDENCE_SCHEMA) return null;
    return normalizeCaseRetestEvidence(parsed.evidence);
  } catch {
    return null;
  }
}

export function mergeCaseRetestEvidence(
  ...groups: ReadonlyArray<readonly CaseRetestEvidence[]>
) {
  const byId = new Map<string, CaseRetestEvidence>();

  // 后传入的数据优先：数据库记录可以覆盖构建时 manifest 的同一条证据。
  for (const group of groups) {
    for (const evidence of group) {
      byId.set(evidence.id, evidence);
    }
  }

  return [...byId.values()].sort((a, b) =>
    b.testedAt.localeCompare(a.testedAt) || a.id.localeCompare(b.id)
  );
}
