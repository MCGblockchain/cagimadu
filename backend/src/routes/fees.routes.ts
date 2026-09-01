import { Router } from 'express'
import { FeesController } from '../controllers/fees.controller.js'
import type { EthereumServiceContract } from '../services/ethereum.service.js'

export const feesRoutes = (ethereum: EthereumServiceContract) => {
  const router = Router()
  const controller = new FeesController(ethereum)
  router.get('/current', controller.current)
  router.get('/history', controller.history)
  return router
}
