import { defineConfig } from '@lambdahk/core'

export default defineConfig({
  name: "fetchie",
  version: "0.1.0",
  description: "A secure Lambda Hook extension\nThis is a plugin by default to commnunicate with the hook manager from the parent application securely.\nVisit: Lambdahook.io for more information",
  author: "https://www.github.com/loluwafemi",
  tags: ["Security", "Hook", "Lambda", "Default"],
  config: {
    enabled: { type: "boolean", default: true }
  }
})