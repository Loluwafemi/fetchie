"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = fetchie;
const dotenv = __importStar(require("dotenv"));
const inject_1 = require("./inject");
dotenv.config();
class FetchieBuilder {
    url;
    opts = { responseType: "json" };
    body;
    method = "GET";
    context = (0, inject_1.contextField)();
    constructor(url) {
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
    withTimeout(ms) {
        this.opts.timeout = ms;
        return this;
    }
    withRetry(count, strategy = "exponential") {
        this.opts.retry = { count, delay: strategy };
        return this;
    }
    withCircuitBreaker() {
        this.opts.circuitBreaker = true;
        return this;
    }
    withLogging(level = "error") {
        this.opts.logging = level;
        return this;
    }
    // define master control header for CORS
    withHeaders(headers) {
        this.opts.headers = { ...this.opts.headers, ...headers };
        return this;
    }
    // Output customization
    withJsonResponse() {
        this.opts.responseType = "json";
        return this;
    }
    withTextResponse() {
        this.opts.responseType = "text";
        return this;
    }
    withJson(body) {
        this.body = JSON.stringify(body);
        return this;
    }
    withFormData(form) {
        this.body = form;
        return this;
    }
    async send() {
        const securedHeader = this.context.app;
        const optsHeader = this.opts.headers;
        const OutputHeader = Object.assign({ ...securedHeader, ...optsHeader }, {});
        this.opts.headers = OutputHeader;
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
        const requestStatus = res.status !== 200 || !res.ok ? false : true;
        if (!requestStatus) {
            return {
                granted: requestStatus,
                ...(await res.json())
            };
        }
        else {
            switch (this.opts.responseType) {
                case "text":
                    return {
                        granted: requestStatus,
                        fetchie_headers: {
                            result: await res.json()
                        },
                        reason: "Response needs to be converted to string manually. use JSON.stringify() as you wish"
                    };
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
async function fetchie(url) {
    return new FetchieBuilder(url);
}
// Bonus shortcuts
// fetchie.get = (url: string) => new FetchieBuilder(url).get()
// fetchie.post = (url: string) => new FetchieBuilder(url).post()
//# sourceMappingURL=index.js.map