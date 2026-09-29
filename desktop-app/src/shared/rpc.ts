import type { RPCSchema } from "electrobun/main";

export interface PingResponse {
	nonce: string;
	runtime: "bun";
	version: string;
}

export interface DesktopRPCClient {
	request: {
		ping(params: { nonce: string }): Promise<PingResponse>;
	};
}

export function createPingResponse(nonce: string, version: string): PingResponse {
	return { nonce, runtime: "bun", version };
}

export type DesktopRPCSchema = {
	bun: RPCSchema<{
		requests: {
			ping: {
				params: { nonce: string };
				response: PingResponse;
			};
		};
	}>;
	webview: RPCSchema;
};