# Sprint 100 Specification and Example Test Matrix

## Status and Authority

This matrix maps the accepted Sprint 095 function contract and completed
Sprints 096-099 to Sprint 100 author-facing evidence. Sprint 095-099 are
accepted; Sprint 100 implementation requires separate execution authorization
and an approved exact path/evidence plan.

## Specification Coverage

| Case ID | Contract area | Required spec coverage | Source authority |
| --- | --- | --- | --- |
| `DOC100-SYNTAX-01` | Both body forms | EBNF or equivalent for expression and brace statement bodies; parameter/return types; newline separators; no semicolons. | Accepted Sprint 095 contract; S096 AST/parser evidence. |
| `DOC100-SYNTAX-02` | Legal statements | Initialized `let`, assignment, `+=`, standalone if/optional else, statement for, return, named-list add/remove. | D-095-08; S096 parser evidence. |
| `DOC100-RETURN-01` | Function return flow | Direct/nested return exits function; complete/incomplete branch and loop behavior; later return; unreachable statements checked. | D-095-04/05/10/12; S098 evidence. |
| `DOC100-RETURN-02` | Return-context distinctions | Expression body unchanged; braced-if-expression returns provide expression value; expression-loop returns collect values outside functions; no expression loop inside a function. | D-095-15; S096/S098 evidence. |
| `DOC100-SCOPE-01` | Lexical bindings | Parameter scope, source order, repeated-let update, nested shadow, branch/loop lifetime, assignment, iterator restoration, no capture. | D-095-03/14; S097/S098 evidence. |
| `DOC100-LIST-01` | List parameter values | Independent recursive array copies per list parameter, including repeated/nested args; non-array elements opaque; local list returns direct. | D-095-06/07/11; S097 evidence. |
| `DOC100-DIAG-01` | Diagnostics | Exact AMX3006 parser messages; AMX3002 incompatible return; AMXF4001 missing return at closing brace; AMXF4002 runtime guard; AMX3021 reserved for if expression. | Accepted S095 matrix plus later S097 allocation. |
| `DOC100-EXCLUDE-01` | Compatibility exclusions | No recursion, forward refs, closures, nested loops, break/continue, module/document/output actions or generalized object copying. | Accepted S095 contract. |

## Valid Example Cases

| Case ID | Example section | Required output/assertion | Owner/test |
| --- | --- | --- | --- |
| `EX100-01` | Expression body | `triple(4) = 12`; existing lesson 03 results remain unchanged. | `tests/examples.test.ts` |
| `EX100-02` | Direct statement body | Local declaration then return yields exact numeric result. | Example runtime test |
| `EX100-03` | Complete nested branches | Each conditional path returns a type-compatible string/value. | Example runtime test |
| `EX100-04` | Return in statement loop | First item return exits; empty list follows a later fallback return. | Example runtime test |
| `EX100-05` | Local and parameter mutation | Rebinding a parameter does not change caller binding; nested local does not escape. | Example runtime test |
| `EX100-06` | Local list returned | Add/remove output matches exact accepted behavior. | Example runtime test |
| `EX100-07` | Nested list parameter copy | Mutate each nested row in the function; caller nested arrays unchanged; result contains changes. | Example runtime test |
| `EX100-08` | Repeated list arg | Mutate one parameter and return the other; second parameter and caller remain unchanged. | Example runtime test |
| `EX100-09` | Formatted/reference stability | `formatAmxDocument` is idempotent; valid program stays parse/check/run equivalent. | `tests/examples.test.ts` / `tests/formatter.test.ts` |

## Negative Fixture

| Case ID | Fixture | Expected failure | Required assertion |
| --- | --- | --- | --- |
| `NEG100-RETURN-01` | `examples/fixtures/invalid/missing-function-return.amx` | `AMXF4001: Missing return value from function` at the closing function brace. | Exact code/message/line/column; test must not treat fixture as successful output. |

The fixture must be a complete source envelope in the guide invalid-fixture
directory and should demonstrate a reachable fallthrough path such as an if
without else. Do not make it a lesson link or include it in the set of valid
examples executed for success.

## Reference, README, Help, and Resource Cases

| Case ID | Consumer | Required assertion |
| --- | --- | --- |
| `LINK100-INDEX-01` | `examples/00_Table_of_Contents.amx` | Reference 15 is listed under standalone references and not in the guided 01-12 sequence. All targets exist and remain contained. |
| `LINK100-LESSON-01` | `examples/03_Collections_and_Functions.amx` | Expression-body sample/outcomes remain intact; any link to 15 is non-sequential reference navigation. |
| `LINK100-README-01` | Root README | V0.16 specification and function-body example are discoverable; old V0.14 links remain. |
| `LINK100-EXT-01` | VS Code README | Version-specific syntax/spec references are current and additive. |
| `HELP100-01` | Desktop `language-v0.16` Help topic | Search terms include `function body`, `return`, `AMXF4001`, list copy and exact spec/reference links; existing topic IDs remain unique. |
| `PKG100-01` | Desktop `DESKTOP_GUIDE_FILES` and guide resource tests | New guide reference and invalid fixture are explicitly allowlisted; source/package parity and materialization pass without unexpected files. |
| `UI100-01` | Desktop Help UI | V0.16 topic is discoverable by search and presents links/text for spec and example. |

## Verification and Preservation

- Run valid example through `checkDocument` and runtime/CLI; assert exact
  binding values for both function forms and list isolation.
- Run the negative fixture separately and assert AMXF4001. Do not include it
  in a successful example loop.
- Test existing 00-14 path/navigation assertions with the added reference;
  update exact arrays only for approved additions and do not reorder existing
  documents.
- Assert the allowlist and staged guide contain exactly the canonical
  resources, including the new files, and no unexpected outputs.
- Use temporary output directories for any CLI export/render. Preserve
  existing generated outputs and user artifacts.
- Record exact command/results and any unavailable package/host/platform
  routes; Sprint 100 is not Sprint 101 integrated closeout.