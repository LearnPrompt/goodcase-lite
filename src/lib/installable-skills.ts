import manifest from "@/generated/installable-skills.json";

export type InstallableSkillPackage = {
  slug: string;
  kind: "shared" | "creator_method";
  category: "image" | "video" | "web" | "copy" | "hardware";
  caseCount: number;
  creatorCount: number;
};

const packages = manifest as InstallableSkillPackage[];
const packagesBySlug = new Map(
  packages.map((item) => [item.slug, item])
);

export function getInstallableSkillPackages() {
  return packages;
}

export function getInstallableSkillPackage(slug: string) {
  return packagesBySlug.get(slug) || null;
}

export function getSkillInstallCommand(slug: string) {
  return `npx skills add LearnPrompt/goodcaseai --skill ${slug} --global --copy --yes --full-depth`;
}

export function getSkillDownloadPath(slug: string) {
  return `/skill-packages/${slug}.skill`;
}

export function getSkillSourceUrl(slug: string) {
  return `https://github.com/LearnPrompt/goodcaseai/tree/main/skills/generated/${slug}`;
}
