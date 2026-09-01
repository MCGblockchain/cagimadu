import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import type { ApiResponse } from '../models/api.model.js'
import type { BlockModel } from '../models/block.model.js'
import type { EthereumServiceContract } from '../services/ethereum.service.js'

const listSchema = z.object({
  limit: z.coerce.number().int().min(1).max(40).default(40),
})

const blockSchema = z.object({
  number: z.string().regex(/^\d+$/, 'O número do bloco deve conter apenas dígitos.'),
})

export class BlocksController {
  constructor(private readonly ethereum: EthereumServiceContract) {}

  list = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { limit } = listSchema.parse(request.query)
      const result = await this.ethereum.getRecentBlocks(limit)
      const body: ApiResponse<BlockModel[]> = {
        data: result.data,
        meta: { source: 'ethereum-rpc', cached: result.cached, stale: result.stale, updatedAt: result.updatedAt },
      }
      response.json(body)
    } catch (error) {
      next(error)
    }
  }

  show = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { number } = blockSchema.parse(request.params)
      const result = await this.ethereum.getBlock(BigInt(number))
      const body: ApiResponse<BlockModel> = {
        data: result.data,
        meta: { source: 'ethereum-rpc', cached: result.cached, stale: result.stale, updatedAt: result.updatedAt },
      }
      response.json(body)
    } catch (error) {
      next(error)
    }
  }
}
