interface ErrorStateProps {
  mensagem: string
  tentarNovamente?: () => void
}

export default function ErrorState({ mensagem, tentarNovamente }: ErrorStateProps) {
  return (
    <div className="rounded-2xl border border-red-200 bg-red-50 px-6 py-5 text-red-950" role="alert">
      <p className="leading-6">{mensagem}</p>
      {tentarNovamente && (
        <button
          type="button"
          onClick={tentarNovamente}
          className="mt-4 rounded-lg border border-red-300 px-4 py-2 text-sm font-semibold transition hover:bg-red-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700"
        >
          Tentar novamente
        </button>
      )}
    </div>
  )
}
