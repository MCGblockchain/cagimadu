import { useMemo, useState } from 'react'
import { ActivityIcon, FuelIcon } from './Icons'
import type { CurrentFeeData, FeeHistoryData } from '../types'

type OperationId = 'transfer' | 'swap' | 'nftMint' | 'contract' | 'custom'

interface OperationPreset {
  id: OperationId
  label: string
  helper: string
  gasUnits: number
}

interface TransactionPlannerProps {
  current: CurrentFeeData
  history: FeeHistoryData
}

const operationPresets: OperationPreset[] = [
  { id: 'transfer', label: 'Transferência', helper: 'Envio simples de ETH', gasUnits: 21_000 },
  { id: 'swap', label: 'Swap DEX', helper: 'Troca comum em protocolo DeFi', gasUnits: 150_000 },
  { id: 'nftMint', label: 'Mint NFT', helper: 'Cunhagem com contrato padrão', gasUnits: 100_000 },
  { id: 'contract', label: 'Contrato', helper: 'Interação mais pesada', gasUnits: 260_000 },
  { id: 'custom', label: 'Custom', helper: 'Informe seu próprio gas', gasUnits: 120_000 },
]

const ethCost = (feeGwei: number, gasUnits: number) => feeGwei * gasUnits * 1e-9

const formatEth = (value: number) => `${value.toFixed(value >= 0.01 ? 5 : 6)} ETH`

const plannerTone = (currentFee: number, averageFee: number, minimumFee: number) => {
  const comparedToAverage = averageFee > 0 ? ((currentFee - averageFee) / averageFee) * 100 : 0
  const nearMinimum = minimumFee > 0 && currentFee <= minimumFee * 1.12

  if (nearMinimum) {
    return {
      label: 'Boa janela',
      className: 'good',
      title: 'A rede está perto da faixa mais barata',
      text: 'Se a operação é útil agora, o custo está competitivo em relação ao intervalo recente.',
    }
  }

  if (comparedToAverage <= 8) {
    return {
      label: 'Aceitável',
      className: 'ok',
      title: 'O custo está próximo da média',
      text: 'Para operações simples ou com alguma urgência, executar agora ainda faz sentido.',
    }
  }

  if (comparedToAverage <= 28) {
    return {
      label: 'Melhor esperar',
      className: 'watch',
      title: 'Há espaço para economizar',
      text: 'Se a transação não for urgente, aguardar uma normalização pode reduzir o custo.',
    }
  }

  return {
    label: 'Rede cara',
    className: 'hot',
    title: 'A fee está bem acima da média',
    text: 'Evite operações não urgentes. O histórico recente indica uma janela de custo elevada.',
  }
}

export function TransactionPlanner({ current, history }: TransactionPlannerProps) {
  const [selectedId, setSelectedId] = useState<OperationId>('swap')
  const [customGas, setCustomGas] = useState(120_000)

  const selectedPreset = operationPresets.find((preset) => preset.id === selectedId) ?? operationPresets[1]
  const gasUnits = selectedPreset.id === 'custom' ? Math.max(1, customGas) : selectedPreset.gasUnits

  const simulation = useMemo(() => {
    const currentCost = ethCost(current.recommendedFeeGwei, gasUnits)
    const averageCost = ethCost(history.average, gasUnits)
    const minimumCost = ethCost(history.minimum, gasUnits)
    const potentialSaving = currentCost > minimumCost ? currentCost - minimumCost : 0
    const savingPercent = currentCost > 0 ? (potentialSaving / currentCost) * 100 : 0
    const tone = plannerTone(current.recommendedFeeGwei, history.average, history.minimum)

    return {
      currentCost,
      averageCost,
      minimumCost,
      potentialSaving,
      savingPercent,
      tone,
    }
  }, [current.recommendedFeeGwei, gasUnits, history.average, history.minimum])

  return (
    <section className="transaction-planner" aria-label="Simulador de custo de transação">
      <div className="planner-head">
        <div>
          <span className="chart-kicker">SIMULAR OPERAÇÃO</span>
          <h2>Vale enviar agora?</h2>
          <p>Compare o custo da sua transação com a média e a mínima do período selecionado.</p>
        </div>
        <div className={`planner-verdict ${simulation.tone.className}`}>
          <ActivityIcon size={17} />
          <span>{simulation.tone.label}</span>
        </div>
      </div>

      <div className="planner-scale" aria-label="Critérios do simulador">
        <span><strong>Boa janela</strong> perto da mínima recente</span>
        <span><strong>Aceitável</strong> até 8% acima da média</span>
        <span><strong>Melhor esperar</strong> até 28% acima da média</span>
        <span><strong>Rede cara</strong> acima desse ponto</span>
      </div>

      <div className="planner-body">
        <div className="operation-picker" role="list" aria-label="Tipo de operação">
          {operationPresets.map((preset) => (
            <button
              key={preset.id}
              type="button"
              className={preset.id === selectedId ? 'active' : ''}
              onClick={() => setSelectedId(preset.id)}
            >
              <strong>{preset.label}</strong>
              <span>{preset.helper}</span>
              <small>{preset.gasUnits.toLocaleString('pt-BR')} gas</small>
            </button>
          ))}
        </div>

        <div className="planner-result">
          <div className="gas-input-row">
            <span><FuelIcon size={16} /> Gas usado</span>
            {selectedPreset.id === 'custom' ? (
              <input
                type="number"
                min="1"
                max="5000000"
                step="1000"
                value={customGas}
                onChange={(event) => setCustomGas(Number(event.target.value))}
                aria-label="Gas customizado"
              />
            ) : (
              <strong>{gasUnits.toLocaleString('pt-BR')}</strong>
            )}
          </div>

          <div className="cost-comparison">
            <div>
              <span>Custo agora</span>
              <strong>{formatEth(simulation.currentCost)}</strong>
              <small>{current.recommendedFeeGwei.toFixed(2)} Gwei</small>
            </div>
            <div>
              <span>Na média recente</span>
              <strong>{formatEth(simulation.averageCost)}</strong>
              <small>{history.average.toFixed(2)} Gwei</small>
            </div>
            <div>
              <span>Na mínima recente</span>
              <strong>{formatEth(simulation.minimumCost)}</strong>
              <small>{history.minimum.toFixed(2)} Gwei</small>
            </div>
          </div>

          <div className="planner-callout">
            <div>
              <span>Economia potencial</span>
              <strong>{formatEth(simulation.potentialSaving)}</strong>
              <small>{simulation.savingPercent.toFixed(1)}% se voltar à mínima recente</small>
            </div>
            <div>
              <h3>{simulation.tone.title}</h3>
              <p>{simulation.tone.text}</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
