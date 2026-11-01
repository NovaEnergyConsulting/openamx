# OpenAMX 0.18.0

OpenAMX 0.18 adds generated diagram elements, letting AMX documents build ordered groups of primitives with diagram-local loops and conditional branches.

## Highlights

- Add `for` loops and braced `if`/`else` blocks inside diagrams, with deterministic source-order expansion.
- Diagram membership is established when the model is created and remains stable during playback; supported primitive properties continue to respond to timeline variable `t`.
- Each evaluated diagram permits up to 64 control-originating emissions. The separate 512 authored-primitive report limit is unchanged.
- Version 2 scene-model serialization preserves ordered generated instances and supported loop bindings; version 1 diagrams without generation remain readable.
- The VS Code and desktop editors recognize nested diagram controls. The V0.18 language specification and generated-elements walkthrough are included.
- Standalone HTML remains interactive. PDF and DOCX render the lower-bound static frame.

## Compatibility and limits

Nested `for` loops are not supported, and `t` cannot control loop iteration or conditional selection. The generated-output cap limits emitted elements, not iteration count, CPU time, or memory use.

The full root test suite passed with 629 tests and 0 failures. The S114 closeout also recorded Windows VS Code and desktop preview-harness residuals; native WebView and cross-platform validation were unavailable or not run. Those results remain distinct from the passing root suite.
