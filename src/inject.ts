import { HookContext, ValidateHook, defineHook } from "@lambdahk/core";

// auto-default fillup from the environment
export function contextField(overrides: Partial<HookContext> = {}): HookContext {
    return {
        app: {
            lambda_token: process.env.LAMBDAHOOK_SECRET!,
            lambda_app_id: process.env.LAMBDAHOOK_APP_ID!,
            lambda_origin: process.env.LAMBDAHOOK_URL!,
            lambda_env: {}, 
            lambda_rate_limit: Number(process.env.LAMBDAHOOK_TIMEOUT) 
        },
      host: process.env.LAMBDAHOOK_URL!,
      target_url: overrides.target_url!,
      timestamp: new Date(),
      log: () => {},
      ...overrides
    }
}


export const validate: ValidateHook = async (ctx, config) => {

    if (!config['enabled']) {
      return { granted: true }
    }
  
    // Example: Block requests from suspicious IPs
    const allowedIPs = process.env.LAMBDAHOOK_WHITELISTIPS!.split(',')
    
    if (allowedIPs.includes(ctx.host)) {
      ctx.log('Whitelisted IP', { ip: ctx.host })
      return {
        granted: true,
        reason: 'Allowed IP Address.',
        extra_headers: { 'Granted By': 'LambdaHook' }
      }
    } else {
        return {
            granted: false,
            reason: 'Blocked IP Address.',
            extra_headers: { 'Blocked By': 'LambdaHook' }
        }
    }
}
  
export default defineHook(validate)