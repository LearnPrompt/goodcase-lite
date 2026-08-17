type RelatedCaseFields = {
  slug: string;
  category: string;
  recommendedModels: string[];
};

export const MISSING_MODEL = "待补充模型";

function hasModelOverlap(a: RelatedCaseFields, b: RelatedCaseFields) {
  const models = new Set(
    a.recommendedModels
      .filter((model) => model !== MISSING_MODEL)
      .map((model) => model.toLowerCase())
  );
  return b.recommendedModels.some(
    (model) =>
      model !== MISSING_MODEL && models.has(model.toLowerCase())
  );
}

function relationshipScore(a: RelatedCaseFields, b: RelatedCaseFields) {
  const sameCategory = a.category === b.category;
  const sameModel = hasModelOverlap(a, b);

  if (sameCategory && sameModel) return 3;
  if (sameCategory) return 2;
  if (sameModel) return 1;
  return 0;
}

export function getRelatedCases<T extends RelatedCaseFields>(
  item: T,
  allItems: T[],
  limit = 3
) {
  return allItems
    .filter((candidate) => candidate.slug !== item.slug)
    .map((candidate) => ({
      candidate,
      score: relationshipScore(item, candidate),
    }))
    .filter(({ score }) => score > 0)
    .sort(
      (a, b) =>
        b.score - a.score ||
        a.candidate.slug.localeCompare(b.candidate.slug)
    )
    .slice(0, Math.max(0, limit))
    .map(({ candidate }) => candidate);
}
