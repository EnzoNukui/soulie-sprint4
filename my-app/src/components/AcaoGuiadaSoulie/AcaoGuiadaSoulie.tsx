import { useEffect, useId, useRef, useState } from 'react'
import { ArrowUpRight, Compass, MessageCircle, Plus, RotateCcw, Search, Target, UsersRound, X } from 'lucide-react'
import { useTutorialSoulie, type TutorialSoulie } from '../TutorialSoulie/TutorialSoulieContext'

const icones = {
  missao: Target,
  comunidade: UsersRound,
  publicacao: MessageCircle,
  explorar: Search,
  criar: Plus,
  retomar: RotateCcw,
}

interface OpcaoGuiaSoulie {
  id: string
  titulo: string
  descricao: string
  acao: string
  icone: keyof typeof icones
  destaque?: boolean
}

export type PassoGuiaSoulie = OpcaoGuiaSoulie & (
  | { tutorial: TutorialSoulie; executar?: never }
  | { executar: () => void; tutorial?: never }
)

interface AcaoGuiadaSoulieProps {
  imagem: string
  titulo: string
  passos: PassoGuiaSoulie[]
  carregando?: boolean
}

export default function AcaoGuiadaSoulie({ imagem, titulo, passos, carregando = false }: AcaoGuiadaSoulieProps) {
  const { ativo, iniciarTutorial } = useTutorialSoulie()
  const [aberto, setAberto] = useState(false)
  const id = useId()
  const guiaRef = useRef<HTMLDivElement>(null)
  const botaoRef = useRef<HTMLButtonElement>(null)
  const fecharRef = useRef<HTMLButtonElement>(null)
  const primeiroPassoRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!aberto) return

    const primeiroControle = primeiroPassoRef.current ?? fecharRef.current
    primeiroControle?.focus()

    function fecharAoClicarFora(event: PointerEvent) {
      if (event.target instanceof Node && !guiaRef.current?.contains(event.target)) setAberto(false)
    }

    function fecharComEscape(event: KeyboardEvent) {
      if (event.key !== 'Escape') return
      event.preventDefault()
      setAberto(false)
      botaoRef.current?.focus()
    }

    document.addEventListener('pointerdown', fecharAoClicarFora)
    document.addEventListener('keydown', fecharComEscape)
    return () => {
      document.removeEventListener('pointerdown', fecharAoClicarFora)
      document.removeEventListener('keydown', fecharComEscape)
    }
  }, [aberto])

  function fechar() {
    setAberto(false)
    botaoRef.current?.focus()
  }

  if (ativo) return null

  return (
    <div ref={guiaRef} className="fixed bottom-24 right-4 z-40 sm:right-6 lg:bottom-7">
      {aberto && (
        <section
          id={id}
          role="dialog"
          aria-labelledby={id + '-titulo'}
          aria-describedby={id + '-descricao'}
          className="soulie-guia-trilha absolute bottom-full right-0 mb-4 flex w-[min(20rem,calc(100vw-2rem))] max-h-[calc(100dvh-13rem)] flex-col overflow-hidden rounded-3xl border border-zinc-200/80 bg-white p-4 shadow-[0_12px_40px_-16px_rgba(46,16,101,0.2)] sm:max-h-[calc(100dvh-12rem)] lg:max-h-[calc(100dvh-9rem)]"
        >
          <header className="flex shrink-0 items-start gap-3">
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-[11px] font-medium text-violet-600"><Compass aria-hidden="true" className="h-3 w-3" /> Soulie</p>
              <h2 id={id + '-titulo'} className="mt-1 text-base font-semibold leading-6 text-zinc-900">{titulo}</h2>
            </div>
            <button ref={fecharRef} type="button" onClick={fechar} aria-label="Fechar guia da Soulie" className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-zinc-400 transition hover:bg-zinc-100 hover:text-zinc-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">
              <X aria-hidden="true" className="h-4 w-4" />
            </button>
          </header>

          <p id={id + '-descricao'} className="sr-only">Escolha o que você quer aprender. A Soulie vai mostrar cada passo na tela.</p>

          {carregando ? (
            <div role="status" className="mt-3 px-1 py-4 text-sm text-zinc-500">
              Carregando orientações...
            </div>
          ) : (
            <ol className="relative mt-3 min-h-0 space-y-2 overflow-y-auto overscroll-contain py-1 pr-1 before:absolute before:bottom-6 before:left-3 before:top-6 before:border-l before:border-violet-100">
              {passos.map((passo, indice) => {
                const Icone = icones[passo.icone]
                return (
                  <li key={passo.id} className="relative flex gap-2.5">
                    <span aria-hidden="true" className="relative z-10 mt-4 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-white bg-violet-50 text-[10px] font-semibold text-violet-600">{indice + 1}</span>
                    <button
                      ref={indice === 0 ? primeiroPassoRef : undefined}
                      type="button"
                      title={passo.acao}
                      aria-labelledby={id + '-' + passo.id + '-titulo'}
                      aria-describedby={id + '-' + passo.id + '-descricao'}
                      onClick={() => {
                        setAberto(false)
                        if (passo.tutorial) iniciarTutorial({ ...passo.tutorial, imagem })
                        else passo.executar()
                      }}
                      className={'group flex min-w-0 flex-1 items-center gap-2 rounded-2xl border px-3 py-3 text-left transition focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-violet-600 ' + (passo.destaque ? 'border-violet-100 bg-violet-50/80 hover:bg-violet-100/70' : 'border-zinc-100 bg-white hover:border-violet-100 hover:bg-zinc-50')}
                    >
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center gap-2">
                          <Icone aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-violet-500" />
                          <span id={id + '-' + passo.id + '-titulo'} className="text-[13px] font-semibold leading-5 text-zinc-900">{passo.titulo}</span>
                        </span>
                        <span id={id + '-' + passo.id + '-descricao'} className="mt-1 block text-xs leading-[1.55] text-zinc-500">{passo.descricao}</span>
                      </span>
                      <ArrowUpRight aria-hidden="true" className="h-3.5 w-3.5 shrink-0 text-zinc-400 transition group-hover:text-violet-600" />
                    </button>
                  </li>
                )
              })}
            </ol>
          )}
        </section>
      )}

      <button
        ref={botaoRef}
        data-soulie-launcher
        type="button"
        aria-label={aberto ? 'Fechar guia da Soulie' : 'Abrir guia da Soulie'}
        aria-expanded={aberto}
        aria-controls={aberto ? id : undefined}
        onClick={() => setAberto((valor) => !valor)}
        className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-transparent p-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600"
      >
        <span aria-hidden="true" className="absolute inset-3 rounded-full bg-violet-100/60 blur-md transition group-hover:bg-violet-200/60" />
        <img src={imagem} alt="" className="soulie-guia-avatar relative h-full w-full object-contain drop-shadow-[0_6px_12px_rgba(109,40,217,0.12)]" />
        <span aria-hidden="true" className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 rounded-full border border-zinc-200/80 bg-white/95 px-2 py-0.5 text-[9px] font-medium tracking-wide text-zinc-500">guia</span>
      </button>
    </div>
  )
}
