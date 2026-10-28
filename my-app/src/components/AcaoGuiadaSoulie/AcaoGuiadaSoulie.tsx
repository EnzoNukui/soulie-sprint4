import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'

interface AcaoGuiadaSoulieProps {
  imagem: string
  mensagem: string
  rotuloAcao: string
  onAcao: () => void
}

export default function AcaoGuiadaSoulie({ imagem, mensagem, rotuloAcao, onAcao }: AcaoGuiadaSoulieProps) {
  const [aberto, setAberto] = useState(false)

  function executarAcao() {
    setAberto(false)
    onAcao()
  }

  return (
    <div className="fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 lg:bottom-auto lg:right-6 lg:top-1/2 lg:-translate-y-1/2">
      {aberto && (
        <section
          role="dialog"
          aria-label="Sugestão da Soulie"
          className="w-[min(20rem,calc(100vw-2rem))] rounded-2xl border border-violet-200 bg-white p-5 shadow-[0_18px_55px_-24px_rgba(46,16,101,0.38)]"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <img src={imagem} alt="" className="h-12 w-12 shrink-0 object-contain" />
              <h2 className="font-bold text-violet-800">Uma dica da Soulie</h2>
            </div>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar sugestão"
              className="rounded-lg p-1 text-zinc-500 transition hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-3 text-sm leading-6 text-zinc-600">{mensagem}</p>
          <button
            type="button"
            onClick={executarAcao}
            className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-violet-700 transition hover:text-violet-900 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600"
          >
            {rotuloAcao} <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </button>
        </section>
      )}

      <button
        type="button"
        aria-label={aberto ? 'Fechar sugestão da Soulie' : 'Abrir sugestão da Soulie'}
        aria-expanded={aberto}
        onClick={() => setAberto((valor) => !valor)}
        className="flex h-16 w-16 items-center justify-center rounded-full border border-violet-200 bg-white p-1 shadow-[0_10px_28px_-12px_rgba(76,29,149,0.6)] transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
      >
        <img src={imagem} alt="" className="h-full w-full object-contain" />
      </button>
    </div>
  )
}
