import cors from 'cors'
import express from 'express'
import { env } from './config/env.js'
import { errorHandler, notFoundHandler } from './middleware/error-handler.js'
import { blocksRoutes } from './routes/blocks.routes.js'
import { feesRoutes } from './routes/fees.routes.js'
import { ethereumService, type EthereumServiceContract } from './services/ethereum.service.js'

interface AppDependencies {
  ethereum?: EthereumServiceContract
}

export const createApp = (dependencies: AppDependencies = {}) => {
  const app = express()
  const ethereum = dependencies.ethereum ?? ethereumService
  const allowedOrigins = env.CORS_ORIGIN.split(',').map((origin) => origin.trim())

  app.disable('x-powered-by')
  app.use(cors({ origin: allowedOrigins }))
  app.use(express.json({ limit: '32kb' }))
  app.use((_request, response, next) => {
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Referrer-Policy', 'no-referrer')
    next()
  })

  app.get('/api/health', (_request, response) => {
    response.json({ status: 'ok', service: 'cagimadu-api', timestamp: new Date().toISOString() })
  })
  app.use('/api/blocks', blocksRoutes(ethereum))
  app.use('/api/fees', feesRoutes(ethereum))
  app.use(notFoundHandler)
  app.use(errorHandler)

  return app
}
