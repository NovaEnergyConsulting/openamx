# Sprint 124 Output Safety and Rollback Contract

## Status and Authority

Architect-prepared output contract. Preserve D121-08 and D121-18. Multi-file
publication is best-effort with per-path reporting and is not crash-atomic.
The contract must not be described as a transaction or guaranteed rollback.

## Destination Root

- Require a non-empty explicit output directory. Resolve its canonical path
  and ensure every mapped target remains beneath that root after path and
  symlink resolution.
- If the output root does not exist, create it only after the complete source
  graph passes parse/type/module checks, S123 returns a successful complete
  graph, and destination preflight passes. Track created directories for
  cleanup on pre-publication failure.
- An output root may not alias the source/import root in a way that permits
  generated `.ts` files to replace source `.amx` files. Reject exact target
  aliasing and symlink traversal outside the output root.
- Preserve pre-existing unrelated files/directories. Never recursively clear
  the selected output directory.

## Destination Preflight

- Compute the complete output target set from all successful `TranspiledModule`
  records before any final target is changed.
- Reject duplicate module IDs, duplicate target paths, path normalization
  collisions, file/directory conflicts, case-fold collisions, and targets
  whose canonical path escapes the output root.
- Detect collisions independent of current host: normalize separators and
  Unicode to the accepted normalization form, then compare case-insensitively
  using a stable locale-independent case fold. Record the chosen algorithm in
  tests; do not rely solely on host filesystem behavior.
- Any existing file is a collision unless explicit `--overwrite` is supplied.
  Without overwrite, report all conflicts when safe and write no generated
  graph file.
- With overwrite, only replace files exactly in the generated graph target
  set. Existing unrelated paths remain unchanged.
- `--overwrite` is the proposed explicit CLI confirmation. Do not introduce an
  interactive prompt in a command that may run in scripts unless the Product
  Owner explicitly selects that UX.

## Staging and Publication

- Write every module's exact emitted bytes to a uniquely named staging
  directory on the same filesystem as the output root when possible. Staging
  files are not successful output and are removed after success/failure.
- Verify staged file count, path set, and contents before publication. Do not
  compile/execute generated code as part of CLI transpilation; compilation is
  acceptance-test evidence only.
- For targets being overwritten, preserve prior bytes/metadata in a backup
  area until publication succeeds. Record the target state before every
  replace/move operation.
- Publish only after all graph files are staged. If an operation fails,
  attempt rollback in reverse publication order. Report each target as
  `staged`, `published`, `restored`, or `unrecovered`, plus the underlying
  failure diagnostic.
- On ordinary preflight/validation/cancellation failure, final destinations
  remain unchanged. On a write/publish failure, rollback is best-effort and
  can leave unrecovered files; make this state visible and do not return a
  successful entry path.
- D121-18 explicitly accepts that abrupt process termination, OS crash, power
  loss, or filesystem durability behavior can leave a mixed graph. S124 does
  not promise crash atomicity, cross-volume atomic rename, fsync durability, or
  recovery after process termination.
- A rollback attempt is not reported as successful unless every original
  destination hash/state is verified restored. Otherwise report the exact
  unrecovered paths.

## Cancellation and Cleanup

- Default existing-target refusal is noninteractive. If an explicit
  interactive confirmation path is dispositioned, cancellation occurs before
  final publication and leaves destinations unchanged.
- `--overwrite` refusal/cancel/error leaves originals intact before publish.
  During publish failure, rollback is attempted and accurately reported.
- Remove only S124-created staging/backup files and newly created empty
  directories after their use; never clean pre-existing artifacts or user
  output. Preserve staging/rollback diagnostics under approved evidence roots
  when tests fail.
- No destructive cleanup command may target an unverified path. The Builder
  records before/after manifests for existing output roots under separate
  authorization.

## Required Failure Injection

- Fail while staging a middle module: final targets unchanged; stage cleanup
  recorded.
- Fail on first publish: originals unchanged or restored and reported.
- Fail after at least one successful publish: reverse rollback attempted;
  each restored/unrecovered path reported; no success path returned.
- Fail during rollback itself: retain original publish error plus rollback
  error/path report; never claim all-restored.
- Inject abrupt termination only if a safe harness exists and separately
  authorized. Even if tested, this sprint cannot claim universal crash
  atomicity; D121-18 residual remains.