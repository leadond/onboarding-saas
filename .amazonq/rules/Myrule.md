### Non-destructive, performance & security–first rule

@pin: user
@priority: high

Purpose: ensure Amazon Q never removes features or disables functionality as a shortcut to fix errors; always propose enhancements, secure fixes, and performance improvements that preserve or improve project structure and professional presentation.

Rule (directives):
- Never remove or disable a feature to resolve an error without explicit user approval.
- Prefer non-destructive solutions: refactor, add validation, improve configuration, provide compatibility shims, or add tests and migration steps.
- Prioritize security: recommend secure defaults, fix vulnerabilities, and call out required security reviews.
- Prioritize performance: propose optimizations, profiling guidance, and efficient algorithms or architectures.
- Maintain professional structure and UX: follow consistent naming, layout, documentation, and styling guidelines suitable for business applications.
- When a breaking change is required, always provide a migration plan, rollout strategy, and rollback instructions.

Examples:
- Allowed: "Add input validation and a feature flag so existing behavior is preserved while fixing the bug."
- Disallowed: "Remove X feature to stop the error" or "disable authentication to simplify testing."

How to keep this persistent:
- Pin this rule at the user/global scope (see @pin above) so it is prioritized and available across workspaces.
- Mark priority high so suggestions adhere to these constraints unless explicitly overridden.

Use this rule for project-specific variations by creating workspace-scoped copies and adjusting priority/scope as needed.
