import { FetchieOptions, HookResult } from "./types"
import * as dotenv from "dotenv"
import { contextField, validate } from './inject';

dotenv.config();

class FetchieBuilder {
  private url: string;
  private opts: FetchieOptions = {responseType: "json"};
  private body?: BodyInit;
  private method = "GET";
  protected context = contextField()

  constructor(url: string) {
    this.url = url;
  }

  get() {
    this.method = "GET";
    return this;
  }


  post() {
    this.method = "POST";
    return this;
  }

  withAuth() {
    /* auto-read from env */ return this;
  }


  withTimeout(ms: number) {
    this.opts.timeout = ms;
    return this;
  }


  withRetry(count: number, strategy: "fixed" | "exponential" = "exponential") {
    this.opts.retry = { count, delay: strategy };
    return this;
  }


  withCircuitBreaker() {
    this.opts.circuitBreaker = true;
    return this;
  }


  withLogging(level: "silent" | "error" | "debug" = "error") {
    this.opts.logging = level;
    return this;
  }


  // define master control header for CORS
  withHeaders(headers: Record<string, string>) {
    this.opts.headers = { ...this.opts.headers, ...headers };
    return this;
  }

  // Output customization
  withJsonResponse(): this {
    this.opts.responseType = "json";
    return this;
  }


  withTextResponse(): this {
    this.opts.responseType = "text";
    return this;
  }

  withJson(body: any) {
    this.body = JSON.stringify(body);
    return this;
  }


  withFormData(form: FormData) {
    this.body = form;
    return this;
  }


  async send(): Promise<HookResult> {

    const securedHeader = this.context.app;

    const optsHeader = this.opts.headers

    const OutputHeader = Object.assign({...securedHeader, ...optsHeader}, {})

    this.opts.headers = OutputHeader as Record<string, any>

    const endpoint = this.context.app.lambda_origin;

    const fullUrl = `${endpoint}/api/${this.url}`;

    // auto-inject auth if withAuth() called or env present
    const headers = new Headers(this.opts.headers);

    if (process.env.LAMBDAHOOK_APP_ID) {
      headers.set("x-app-id", process.env.LAMBDAHOOK_APP_ID);
      headers.set("authorization", `Bearer ${process.env.LAMBDAHOOK_SECRET}`);
    }

    const res = await fetch(fullUrl, {
      method: this.method,
      headers,
      body: this.body,
    });
  
  const requestStatus: boolean = res.status !== 200 || !res.ok? false: true
  
  if (!requestStatus) {
    return {
      granted: requestStatus,
      ...(await res.json())
    }
  } else {
      switch (this.opts.responseType) {
        case "text":
          return {
            granted: requestStatus,
            fetchie_headers: {
              result: await res.json()
            },
            reason: "Response needs to be converted to string manually. use JSON.stringify() as you wish"
          }
    
        case "json":
          return {
            granted: requestStatus,
            fetchie_headers: {
              result: await (res.json())
            }
          };

        default:
          return {
            granted: requestStatus,
            fetchie_headers: {
              result: (await res.json())
            }
          };
      }
  }

  }
}

// Global function – the magic entry point
export default async function fetchie(url: string) {
  return new FetchieBuilder(url)
}

// Bonus shortcuts
// fetchie.get = (url: string) => new FetchieBuilder(url).get()
// fetchie.post = (url: string) => new FetchieBuilder(url).post()