---
name: open-source-hardware-build
description: "Apply the Open-source hardware build workflow derived from multiple published GoodCase examples. Use when planning or evaluating an AI hardware experience in this pattern, including requests for AI 硬件, devices, physical interaction, prototypes, or product concepts. Read the bundled Case evidence before producing an artifact."
---

# Open-source hardware build

Turn the method into an executable, Case-grounded workflow. The Skill is incomplete unless the final artifact can be traced to one named anchor Case.

## Inputs

Ask only for missing inputs:

- User, environment, job to be done, and physical constraints.
- Available sensors, compute, connectivity, privacy, and power limits.
- Prototype fidelity and evidence required.
- Preferred anchor Case from `references/cases.md`, or permission to select one.

## Required evidence gate

- Read `references/cases.md` before drafting on every invocation.
- Select exactly one anchor Case. Name it in the response; do not average several unrelated visual styles.
- Inspect the anchor's finished media with an available image, video, or browser tool. If the media cannot be inspected, say so and do not claim visual fidelity.
- Write a reference contract before the artifact:
  - **Preserve:** at least three structural traits supported by the Case evidence.
  - **Replace:** subject, copy, brand, or context supplied by the user.
  - **Avoid:** unrelated dominant motifs and superficial copying of creator identity.

## Workflow

1. Restate the requested deliverable, audience, and success criteria.
2. Read `references/cases.md` and select one anchor Case.
3. Inspect its finished media, summary, and prompt excerpt.
4. Produce the Preserve / Replace / Avoid reference contract.
5. List the core chip, parts, and budget.
6. Point to the firmware or open-source repository.
7. Give steps in the order of assembly, flashing, and debugging.
8. Produce the requested artifact using the output contract below.
9. Compare it with the anchor Case, then revise material failures once.

## Output contract

- A reference contract naming one anchor Case, with Preserve, Replace, and Avoid decisions.
- A hardware experience brief.
- Interaction flow and system boundaries.
- Prototype and validation plan.
- A safety, privacy, and feasibility checklist.

## Verification

- Hardware, software, and human responsibilities are separated.
- Privacy, failure modes, power, connectivity, and physical safety are addressed.
- The proposed behavior can be validated with a concrete prototype.
- The response names one anchor Case and confirms that its evidence file was read.
- At least three visible or structural traits in the artifact map back to the Preserve list.
- No unrelated theme becomes dominant unless the user explicitly requested it.
- If finished media was inaccessible, the response labels the result as prompt-grounded rather than visually verified.
- Distinguish observed evidence from your own recommendation.
- Link or name the relevant GoodCase evidence used for the artifact.

## Safety and attribution

- Do not invent an original prompt, model, result, creator, metric, or source.
- Do not imply this Skill is authored, endorsed, or officially distributed by a referenced creator.
- Preserve creator attribution when reproducing or discussing a source Case.
- Transfer structure and decision logic; do not impersonate a creator or present a close copy as original work.
- Do not publish, purchase, upload private assets, or make external account changes without explicit user approval.
