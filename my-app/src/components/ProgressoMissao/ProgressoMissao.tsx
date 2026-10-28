interface ProgressoMissaoProps {
  diasConcluidos: number
  metaDias: number
}

export default function ProgressoMissao({ diasConcluidos, metaDias }: ProgressoMissaoProps) {
  const metaSegura = Math.max(metaDias, 1)
  const diasExibidos = Math.min(Math.max(diasConcluidos, 0), metaSegura)
  const porcentagem = Math.round((diasExibidos / metaSegura) * 100)

  return (
    <div className="mt-3 w-full">
      <div className="mb-1.5 flex items-center justify-between gap-3 text-xs font-medium text-zinc-600">
        <span>Progresso</span>
        <span>{diasExibidos} de {metaSegura} {metaSegura === 1 ? 'dia' : 'dias'}</span>
      </div>
      <div
        role="progressbar"
        aria-label="Progresso da missão"
        aria-valuemin={0}
        aria-valuemax={metaSegura}
        aria-valuenow={diasExibidos}
        aria-valuetext={`${diasExibidos} de ${metaSegura} ${metaSegura === 1 ? 'dia' : 'dias'}`}
        className="h-2 overflow-hidden rounded-full bg-violet-100"
      >
        <div className="h-full rounded-full bg-violet-600 transition-[width] duration-500" style={{ width: `${porcentagem}%` }} />
      </div>
    </div>
  )
}
