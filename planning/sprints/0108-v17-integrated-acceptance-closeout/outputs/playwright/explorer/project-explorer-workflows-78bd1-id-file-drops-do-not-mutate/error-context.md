# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: project-explorer-workflows.pw.ts >> file drop shares move RPC and invalid file drops do not mutate
- Location: tests\ui\project-explorer-workflows.pw.ts:142:1

# Error details

```
Error: page.evaluate: TypeError: window.__openamxHarnessSnapshot is not a function
    at eval (eval at evaluate (:370:30), <anonymous>:1:14)
    at UtilityScript.evaluate (<anonymous>:372:16)
    at UtilityScript.<anonymous> (<anonymous>:1:44)
```