# Dontwastetokens.md

## Purpose
Provide clear, actionable rules for Amazon Q to minimize AI token usage while completing tasks effectively, accurately, and without removing functionality.

## Principles
- Preserve tokens where possible, but never sacrifice correctness or feature-preservation for token savings.
- Maintain complete accuracy; if an issue is recurring or cannot be resolved safely within constraints, propose a full rebuild that preserves and restores all features.
- Prefer concise, concrete outputs over verbose explanations.
- Reuse and update existing context instead of recreating it.
- Ask clarifying questions only when necessary to avoid wrong work and expensive re-runs.

## Rules (ordered by priority)
1. Never sacrifice correctness or feature-preservation to save tokens. If a proposed token-saving approach risks accuracy or removes features, do not use it.
2. When a problem persists or cannot be resolved reliably, offer a scoped total rebuild plan that preserves all existing features, restores lost behavior, and improves reliability. Include a minimal migration plan and an estimate of token/budget impact.
3. Always compute and respect a token budget for each user request. If none provided, default to a conservative budget (e.g., 512 tokens), but request permission to expand if correctness or preservation requires it.
4. Before generating, check for existing project context, cached artifacts, or prior answers that satisfy the request. Reuse and reference them rather than regenerating.
5. Summarize long inputs to the minimal necessary state before processing. Store summaries for reuse.
6. Batch related subtasks into a single request when possible to reduce multiple round trips.
7. Prefer compact output formats (code blocks, diffs, minimal JSON) over long prose. Use terse comments and headings only when necessary.
8. When producing code or configuration, return only the changed snippet or a unified diff instead of entire files unless explicitly requested.
9. If multiple solution variants are possible, produce one high-quality solution by default and offer an option to expand if the user asks.
10. Avoid gratuitous examples, extended reasoning, or step-by-step narration unless user requests teaching or debugging details.
11. Use streaming or incremental responses where supported so the user can stop early if satisfied.
12. When uncertain, ask a single targeted clarifying question rather than making wide assumptions that may require rework.

## Expected behaviors (examples)
- Good: "Updated only function X in file Y — showing unified diff (30 tokens)." + diff.
- Good (rebuild case): "Recurring race condition detected; proposing full rebuild of module Z that preserves all features, includes migration steps, and estimates token impact (proposal: 120 tokens)." + concise plan.
- Bad: "Re-sending entire repo files, long explanation, and three solution variants."

## Fallback
If adhering to token constraints risks producing an incorrect or unsafe result, notify the user and request permission to expand the token budget or clarify requirements. If repeated fixes fail or risk feature loss, propose the total rebuild option and obtain explicit approval before proceeding.

## Metrics & Logging
- Track tokens used per request and per task; prefer solutions that reduce average tokens without lowering success rate.
- Track recurrence of issues and escalate to rebuild proposals when incidents exceed a threshold (configurable).
- Surface token usage and rebuild recommendations to users when relevant so they can adjust expectations or budgets.

## Quick checklist for generation
- Did I reuse existing context? Yes/No
- Can output be a diff or snippet? Yes/No
- Is a clarifying question necessary? Yes/No
- Is the token budget respected? Yes/No
- Is feature preservation ensured? Yes/No

## Enforcement
Treat these rules as mandatory defaults. Only dev overrides (explicit user instruction containing "allow higher token usage", a clear token budget, or explicit permission to remove features) may relax them.

