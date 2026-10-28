interface LoadingStateProps {
  mensagem?: string
}

export default function LoadingState({ mensagem = 'Carregando...' }: LoadingStateProps) {
  return (
    <div className="flex items-center justify-center gap-3 rounded-2xl bg-violet-50 px-5 py-8 text-violet-900" role="status" aria-live="polite">
      <span aria-hidden="true" className="h-5 w-5 animate-spin rounded-full border-2 border-violet-300 border-t-violet-700 motion-reduce:animate-none" />
      <span>{mensagem}</span>
    </div>
  )
}
