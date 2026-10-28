interface EmptyStateProps {
  titulo: string
  mensagem: string
}

export default function EmptyState({ titulo, mensagem }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-violet-200 bg-white px-6 py-10 text-center">
      <h2 className="text-lg font-semibold text-violet-950">{titulo}</h2>
      <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-zinc-600">{mensagem}</p>
    </div>
  )
}
