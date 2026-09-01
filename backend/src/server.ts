import { createApp } from './app.js'
import { env } from './config/env.js'

const app = createApp()

app.listen(env.PORT, '0.0.0.0', () => {
  console.log(`Cagimadu API disponível em http://localhost:${env.PORT}`)
  console.log(`Ethereum RPC: ${new URL(env.ETH_RPC_URL).host}`)
})
