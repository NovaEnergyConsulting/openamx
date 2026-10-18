# Sprint 090 Lead Developer/Product-Owner Disposition

- Decision date: 2026-10-18
- Sprint: 090, V0.15 Example Information Architecture and Acceptance Contract
- Disposition: `ACCEPTED/CLOSED`
- Architecture exceptions: None

The Lead Developer/product-owner accepted the Builder's proposed information
architecture and feature matrix without exceptions. This resolves the prior
conflict recorded in the Sprint 090 Builder evidence: the earlier
`ACCEPTED/CLOSED` selection was accompanied by text withholding architecture
approval and therefore did not itself pass the gate.

The accepted decisions are:

1. Confirm the proposed `00`-`14` filenames, sequence, objectives, and the
   standalone-reference roles for route measurements (`13`) and the
   battery-resistor example (`14`).
2. Keep the Kitchen Sink and V0.5 sources and their test-only relocation
   decisions under later authorized migration; their exact fixture paths and
   import closures are not Sprint 091 work.
3. Remove the four checked-in HTML snapshots only after Sprint 094 migrates
   their focused assertions to temporary render destinations.
4. Exclude `.openamx/local.json` from any distributable guide; any source-tree
   removal remains subject to later authorization.
5. Use the proposed `data/`, `fixtures/invalid/`, and `libraries/` support
   layout. Lesson 06 may include clearly labeled invalid-only fixtures for
   its negative validation cases.
6. For future desktop guide project creation, materialize the allowlisted
   guide at the empty project root, open the index, and omit the generic
   `report.amx` only for that guided choice; preserve normal project creation
   and both quick starters.
7. Defer the concrete Electrobun resource staging and copy/parity mechanism
   to Sprint 093, with the repository examples remaining canonical.
8. Keep historical V0.1 specification snippets historical unless a
   documentation owner separately authorizes current-path updates.

This disposition approves the architecture contract only. Sprint 091
execution required and received its own separate authorization for the
file-by-file plan documented in Sprint 091 Builder evidence. It does not
authorize packaging, repository-wide migration, release, or publication.
