// must be defined always
export interface HookResult {
  granted: boolean;
  reason?: string;
  fetchie_headers?: FetchieHeaderDefaultType;
}

export type TestConfig = {
    environment: "development"|"production",
    allowed_ip: string[]
}

declare global {
    interface ImportMetaEnv {
      readonly LAMBDAHOOK_URL?: string
      readonly LAMBDAHOOK_APP_ID?: string
      readonly LAMBDAHOOK_SECRET?: string
    }
}
  
export type ResponseType = 'json' | 'text' | 'arrayBuffer' | 'stream' | 'blob'
  
export interface FetchieOptions {
    timeout?: number
    retry?: number | { count: number; delay: 'fixed' | 'exponential' }
    circuitBreaker?: boolean
    logging?: 'silent' | 'error' | 'debug'
    headers?: Record<string, string>
    responseType?: ResponseType
  }


export type FormType = {
  app_id: string
  token: string
  origin: string
}

type FetchieHeaderDefaultType = {
  result: FetchieHeaderResultType
}

type FetchieHeaderResultType = {
  headers: Record<string, any>;
  env: FetchHeaderEnvType[];
  access_token: string,
  meta: {
      cache_hit: boolean,
      latency_ms: number,
      rate_limit: {
          limit: number,
          remaining: number,
          reset_at: string
      }
  }
}

type FetchHeaderEnvType = {
  id: string,
  key: string,
  value: any
}


