import { Router } from 'express'
import { BlocksController } from '../controllers/blocks.controller.js'
import type { EthereumServiceContract } from '../services/ethereum.service.js'

export const blocksRoutes = (ethereum: EthereumServiceContract) => {
  const router = Router()
  const controller = new BlocksController(ethereum)
  router.get('/', controller.list)
  router.get('/:number', controller.show)
  return router
}
