import type { NextFunction, Request, Response } from 'express'
import { z } from 'zod'
import type { ApiResponse } from '../models/api.model.js'
import type { CurrentFeeModel, FeeHistoryModel } from '../models/fee.model.js'
import type { EthereumServiceContract } from '../services/ethereum.service.js'

const historySchema = z.object({
  blocks: z.coerce.number().int().min(2).max(1024).default(300),
})

export class FeesController {
  constructor(private readonly ethereum: EthereumServiceContract) {}

  current = async (_request: Request, response: Response, next: NextFunction) => {
    try {
      const result = await this.ethereum.getCurrentFee()
      const body: ApiResponse<CurrentFeeModel> = {
        data: result.data,
        meta: { source: 'ethereum-rpc', cached: result.cached, stale: result.stale, updatedAt: result.updatedAt },
      }
      response.json(body)
    } catch (error) {
      next(error)
    }
  }

  history = async (request: Request, response: Response, next: NextFunction) => {
    try {
      const { blocks } = historySchema.parse(request.query)
      const result = await this.ethereum.getFeeHistory(blocks)
      const body: ApiResponse<FeeHistoryModel> = {
        data: result.data,
        meta: { source: 'ethereum-rpc', cached: result.cached, stale: result.stale, updatedAt: result.updatedAt },
      }
      response.json(body)
    } catch (error) {
      next(error)
    }
  }
}
