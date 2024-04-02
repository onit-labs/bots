import { describe, expect, it } from 'bun:test'
import app from '../src'

describe('Elysia', () => {
    it('return a response', async () => {

        const response = await app
            .handle(new Request('http://localhost/'))
            .then((res) => res.text())

        expect(response).toBe('Onit XMTP bot 🤖')
    })
})