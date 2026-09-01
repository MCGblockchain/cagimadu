import 'dotenv/config'
import { z } from 'zod'

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(3333),
  ETH_RPC_URL: z.string().url().default('https://ethereum-rpc.publicnode.com'),
  CORS_ORIGIN: z.string().default('http://localhost:5173,http://127.0.0.1:5173'),
  RPC_TIMEOUT_MS: z.coerce.number().int().positive().default(8_000),
  BLOCK_CACHE_TTL_MS: z.coerce.number().int().positive().default(12_000),
  FEE_CACHE_TTL_MS: z.coerce.number().int().positive().default(10_000),
})

const parsed = envSchema.safeParse(process.env)

if (!parsed.success) {
  console.error('Configuração de ambiente inválida:', parsed.error.flatten().fieldErrors)
  throw new Error('Não foi possível iniciar a API: revise as variáveis de ambiente.')
}

export const env = parsed.data
