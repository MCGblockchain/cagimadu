import type { ErrorRequestHandler, RequestHandler } from 'express'
import { ZodError } from 'zod'
import { AppError } from '../utils/app-error.js'

export const notFoundHandler: RequestHandler = (request, response) => {
  response.status(404).json({
    error: { code: 'ROUTE_NOT_FOUND', message: `Rota não encontrada: ${request.method} ${request.path}` },
  })
}

export const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
  void _next
  if (error instanceof ZodError) {
    response.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Parâmetros inválidos.',
        details: error.issues.map((issue) => ({ path: issue.path.join('.'), message: issue.message })),
      },
    })
    return
  }

  if (error instanceof AppError) {
    response.status(error.statusCode).json({ error: { code: error.code, message: error.message } })
    return
  }

  console.error(error)
  response.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Erro interno inesperado.' } })
}
