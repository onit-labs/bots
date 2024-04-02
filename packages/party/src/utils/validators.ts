import z from 'zod'

export const safeUrls = z.record(z.string().url())