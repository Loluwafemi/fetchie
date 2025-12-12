# Fetchie – TypeScript API Reference

**Version**: 1.0.0  
**Last Updated**: December 12, 2025  
**Package**: `@lambdahk/fetchie`  
**Repository**: https://github.com/lambdahk/fetchie

Fetchie is the **official TypeScript SDK** for secure, resilient communication with **LambdaHook** – the edge-based API middleware. It provides zero-config authentication, automatic environment injection, and customizable resilience for client-to-server requests.

---

## Table of Contents

- [Installation](#installation)
- [Environment Requirements](#environment-requirements)
- [Core Concepts](#core-concepts)
- [API Reference](#api-reference)
  - [Main Export](#main-export-fetchie)
  - [Builder Methods](#builder-methods)
  - [Response Customization](#response-customization)
  - [Resilience Options](#resilience-options)
- [Usage Examples](#usage-examples)
- [Flow Diagram](#flow-diagram)
- [Security & Protection](#security--protection)
- [Future Development](#future-development)

---

## Installation

```bash
npm install @lambdahk/fetchie
# or
pnpm add @lambdahk/fetchie
# or
yarn add @lambdahk/fetchie
```

Compatible with Node.js ≥18, Bun, Deno, Cloudflare Workers, and Vercel Edge Runtime.

---

## Environment Requirements

Fetchie uses standard environment variables for auto-authentication (never hardcode secrets).

| Variable               | Description                        | Required | Default |
|------------------------|------------------------------------|----------|---------|
| `LAMBDAHOOK_URL`       | Base URL of your LambdaHook instance | Yes      | None    |
| `LAMBDAHOOK_APP_ID`    | Your application ID                | Yes      | None    |
| `LAMBDAHOOK_SECRET`    | Secret key for Bearer auth         | Yes      | None    |
| `LAMBDAHOOK_TIMEOUT`    | Operation Timeout         | No      | 1000ms    |

**Best Practice**: Use `.env` files, serverless secrets, or platform variables (Vercel, Cloudflare).

---

## Core Concepts

- **Zero-Config**: In most cases, just `import fetchie` and call it – auth is auto-injected from env.
- **Fluent Builder**: Chain methods for full control (timeout, retry, headers, response type).
- **Resilient by Default**: Built-in retry, timeout, and circuit breaker options.
- **Typed Responses**: Customize return type (JSON, text, buffer, stream).
- **Secure**: Secrets never leave server environment; no credential exposure in frontend.

---

## API Reference

### Main Export: `fetchie`

```ts
import fetchie from '@lambdahk/fetchie';

// Primary usage – zero-config
fetchie(path: string): FetchieBuilder
```

Creates a new request builder for the given path.

#### HTTP Method Shortcuts

```ts
fetchie.get(path: string): FetchieBuilder
fetchie.post(path: string): FetchieBuilder
fetchie.put(path: string): FetchieBuilder
fetchie.delete(path: string): FetchieBuilder
fetchie.patch(path: string): FetchieBuilder
```

Convenience methods that set the HTTP verb.

### Builder Methods

All methods return `this` for chaining.

| Method                       | Signature                                      | Description |
|------------------------------|------------------------------------------------|-------------|
| `withAuth()`                 | `withAuth(): this`                             | Auto-injects app ID and secret from env (enabled by default if env vars present) |
| `withTimeout(ms: number)`    | `withTimeout(ms: number): this`                | Sets request timeout |
| `withRetry(count: number, strategy?: 'fixed' \| 'exponential')` | `withRetry(count: number, strategy?: 'fixed' \| 'exponential'): this` | Enables retry with backoff |
| `withLogging(level: 'silent' \| 'error' \| 'debug')` | `withLogging(level: 'silent' \| 'error' \| 'debug'): this` | Controls console logging |
| `withHeaders(headers: Record<string, string>)` | `withHeaders(headers: Record<string, string>): this` | Adds custom headers |
| `withJson(body: unknown)`    | `withJson(body: unknown): this`                | Sets JSON body + Content-Type |
| `withFormData(form: FormData)` | `withFormData(form: FormData): this`         | Sets multipart/form-data body |

### Response Customization

| Method                       | Signature                                      | Returns |
|------------------------------|------------------------------------------------|---------|
| `withJsonResponse()`         | `withJsonResponse<T = any>(): this`            | Parsed JSON (default) |
| `withTextResponse()`         | `withTextResponse<T = string>(): this`         | Plain text string |

### Final Send

```ts
send<T = any>(): Promise<T>
```

Executes the request and returns the typed response.

---

## Usage Examples

### Basic (Zero-Config)

```ts
import fetchie from '@lambdahk/fetchie';

const data = await fetchie('/users/123'); // GET by default
const result = await fetchie.post('/transfer')
  .withJson({ amount: 50000 })
  .send();
```

### Advanced Resilience

```ts
const response = await fetchie('/payment')
  .withTimeout(10000)
  .withRetry(3, 'exponential')
  .withCircuitBreaker()
  .withHeaders({ 'x-device-id': 'mobile-ng' })
  .withJson(payload)
  .withTextResponse()
  .send<string>();
```

---

## Flow Diagram (Text-Based)

```
[Client Application]
        │ import fetchie from '@lambdahk/fetchie'
        ▼
[Fetchie Builder]
        │ Reads LAMBDAHOOK_* env vars
        │ Builds headers (app ID + Bearer token)
        │ Applies timeout/retry/circuit breaker
        ▼
[Secure HTTPS Request]
        │ → LambdaHook Edge Gatekeeper
        ▼
[LambdaHook]
        │ Validates credentials
        │ Runs installed plugins (rate limit, fraud, etc.)
        │ Forwards or blocks
        ▼
[Your Backend API]
        │ Receives authenticated request
        ▼
[Response]
        │ ← Through LambdaHook
        ▼
[Fetchie]
        │ Parses response per requested type
        ▼
[Client Application]
        │ Uses typed data safely
        | Contains expected backend header variables -
        | for original fetch()
        ▼
[Backend Application]

```

---

## Security & Protection

Fetchie is the **only recommended way** to call your backend through LambdaHook.

| Threat                          | Protection Mechanism |
|---------------------------------|----------------------|
| Credential exposure             | Secrets read from server env only |
| Direct backend bypass           | All traffic forced through LambdaHook URL |
| DDoS / abuse                    | Built-in retry + circuit breaker |
| Injection attacks               | Automatic header injection + validation |
| Network failures                | Timeout + exponential retry |
| Cascading failures              | Circuit breaker pattern |

**Only use raw `fetch()` when necessary** — it bypasses LambdaHook security.

---

## Future Development

| Milestone | Planned Features |
|----------|------------------|
| v1.1     | Built-in caching & offline queue |
| v1.2     | OpenTelemetry tracing integration |
| v2.0     | Plugin-aware routing (bypass specific plugins) |
| v2.x     | Framework adapters (Next.js middleware, SvelteKit hooks) |

Contributions welcome: https://github.com/Loluwafemi/fetchie

---

**Fetchie** – Secure. Simple. Type-safe.  
The official way to communicate with LambdaHook.

**LambdaHook Team** – December 12, 2025