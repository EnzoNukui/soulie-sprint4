import { useState } from 'react'
import { ArrowRight, X } from 'lucide-react'

interface AcaoGuiadaSoulieProps {
  imagem: string
  mensagem: string
  rotuloAcao: string
  onAcao: () => void
  posicaoVertical?: 'centro' | 'superior'
}

export default function AcaoGuiadaSoulie({
  imagem,
  mensagem,
  rotuloAcao,
  onAcao,
  posicaoVertical = 'centro',
}: AcaoGuiadaSoulieProps) {
  const [aberto, setAberto] = useState(false)
  const posicionamentoVertical = posicaoVertical === 'superior'
    ? 'top-32 sm:top-36 lg:top-[35%]'
    : 'top-32 sm:top-36 lg:top-[42%]'

  function executarAcao() {
    setAberto(false)
    onAcao()
  }

  return (
    <div className={`fixed right-4 z-40 ${posicionamentoVertical} -translate-y-1/2 sm:right-6`}>
      {aberto && (
        <section
          role="dialog"
          aria-label="Sugestão da Soulie"
          className="absolute right-0 top-full mt-3 w-[min(17rem,calc(100vw-2rem))] rounded-2xl border border-violet-200 bg-white p-4 shadow-[0_18px_55px_-24px_rgba(46,16,101,0.38)] lg:right-full lg:top-1/2 lg:mr-3 lg:mt-0 lg:-translate-y-1/2"
        >
          <div className="flex items-start justify-between gap-3">
            <h2 className="text-sm font-bold text-violet-800">Uma dica da Soulie</h2>
            <button
              type="button"
              onClick={() => setAberto(false)}
              aria-label="Fechar sugestão"
              className="rounded-lg p-1 text-zinc-500 transition hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
            >
              <X aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-2 text-sm leading-5 text-zinc-600">{mensagem}</p>
          <button
            type="button"
            onClick={executarAcao}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-violet-700 transition hover:text-violet-900 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600"
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
        className="flex h-20 w-20 items-center justify-center bg-transparent p-0 transition hover:scale-105 focus-visible:rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
      >
        <img src={imagem} alt="" className="h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(109,40,217,0.2)]" />
      </button>
    </div>
  )
}
