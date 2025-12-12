import { describe, it, expect } from 'vitest'
import fetchie from '@lambdahk/fetchie'


describe('Plugin Validation', () => {
  it('Validate Request', async () => {
    const { granted  } = await (await fetchie("check")).post()
    .withTextResponse()
    .send()
    expect(granted).toBe(granted)
  })


  it('Validate Environments', async () => {
    const { granted, fetchie_headers  } = await (await fetchie("check"))
    .post()
    .withJson({})
    .send()

    const customHeader = new Headers()

    const env = fetchie_headers?.result.env
    
    env?.forEach((envItem, key)=> {
      customHeader.set(envItem.key, envItem.value)
    })

    expect(granted).toBe(granted)
  })


  it('Previewing Response', async () => {
    const Response = await (await fetchie("check"))
    .withJson({})
    .post()
    .send()

    expect(Response.granted).toBe(true)
  })
})