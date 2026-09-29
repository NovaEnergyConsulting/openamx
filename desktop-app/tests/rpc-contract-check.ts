import assert from "node:assert/strict";
import { createPingResponse } from "../src/shared/rpc";

const result = createPingResponse("request-1", "1.4.2");
assert.deepEqual(result, { nonce: "request-1", runtime: "bun", version: "1.4.2" });
assert.deepEqual(Object.keys(result), ["nonce", "runtime", "version"]);
console.log("Typed RPC payload contract passed (2 assertions)");