# Sprint 039 Blueprint: Input Mapping and Report Settings UX

## Approach

1. Confirm the dependency gate. Read the final Sprint 038 evidence when available and verify project generation, config storage, atomic writes, conflict/recovery, and native-service boundaries. If the record remains interim, keep Sprint 039 implementation/acceptance blocked and document the missing decision.
2. Define typed settings/input state. Add active-document declared-input models, effective-source/precedence models, validation status, setting scopes, revision hashes, and bounded diagnostics to the existing RPC/store boundary. Avoid a second mapping/config authority in Vue.
3. Build the Inputs panel. Render only declared logical inputs for the active AMX document, show effective source and type/status, and route Browse/Clear/Open actions through trusted commands. Support missing/invalid navigation and aggregate/fail-fast mode without exposing raw private paths.
4. Implement secure mapping persistence. Keep session/per-run overrides ephemeral, local selections private by default, and project promotion explicit/contained. Merge unrelated valid keys, detect external revision conflicts, preserve exact invalid config text where required, and atomically replace only after complete validation.
5. Build Report Settings. Add a modal with project-default versus current-document override scope, effective-value/inheritance indicators, validation and contrast feedback, and all V0.5 identity/source fields. Route logo selection through the trusted validated asset boundary.
6. Preserve source/config content. Use the existing report preparation/frontmatter/config semantics and add focused preservation tests for unrelated project keys, YAML content/order/comments where supported, current-buffer frontmatter, visible-source defaults, and invalid asset/config no-write behavior.
7. Bind revisions and jobs. Input/config mutations increment the correct revisions, invalidate dependent preview/results, cancel or supersede work through Sprint 036, and reject late replies. Test cancellation, project switching, active-document switching, and stale writes.
8. Exercise native and browser evidence honestly. Run deterministic component/RPC checks for the contextual pane/modal and direct native picker checks when the host exists. Record native-unavailable limitations separately from service and browser evidence.
9. Verify and hand off. Run focused input/report/config tests, desktop direct RPC/typecheck/Vite tests, root compatibility/report tests, VS Code regressions only if shared APIs change, and `git diff --check`. Record evidence, privacy review, bundle impact, and Sprint 040/041/042 entry conditions.

## Files to Update

- `desktop-app/src/mainview/` Inputs panel, report-settings modal, contextual routes, dialogs, and composables
- `desktop-app/src/shared/rpc.ts` and trusted Bun input/config/report/picker services
- `src/runtime/inputData.ts`, report preparation/config/frontmatter helpers only where backward-compatible APIs are required
- Focused desktop/root input, report identity, config preservation, privacy, conflict, and no-write tests
- `desktop-app/README.md` only for verified settings/input behavior
- `planning/state.md`, `planning/decisions.md`, `planning/questions.md`, and a Sprint 039 builder-evidence record

## Notes

The primary risk is a convenient UI that quietly changes precedence or rewrites configuration. Treat effective values as derived state, keep the write path transactional, make privacy visible without leaking data, and preserve the accepted V0.5 report contract exactly. The Inputs panel is contextual to the active AMX document; it must never become a general file browser.
