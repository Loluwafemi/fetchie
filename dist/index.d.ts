import { HookResult } from "./types";
declare class FetchieBuilder {
    private url;
    private opts;
    private body?;
    private method;
    protected context: import("@lambdahk/core").HookContext;
    constructor(url: string);
    get(): this;
    post(): this;
    withAuth(): this;
    withTimeout(ms: number): this;
    withRetry(count: number, strategy?: "fixed" | "exponential"): this;
    withCircuitBreaker(): this;
    withLogging(level?: "silent" | "error" | "debug"): this;
    withHeaders(headers: Record<string, string>): this;
    withJsonResponse(): this;
    withTextResponse(): this;
    withJson(body: any): this;
    withFormData(form: FormData): this;
    send(): Promise<HookResult>;
}
export default function fetchie(url: string): Promise<FetchieBuilder>;
export {};
//# sourceMappingURL=index.d.ts.map