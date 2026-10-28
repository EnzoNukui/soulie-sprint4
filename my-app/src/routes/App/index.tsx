import { useEffect, useState } from 'react'
import { ArrowUpRight, Leaf } from 'lucide-react'
import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import { missaoService } from '../../services/missaoService'
import type { EstadoRequisicao, Missao } from '../../types/api'

export default function AppSoulie() {
  const [missoes, setMissoes] = useState<EstadoRequisicao<Missao[]>>({ status: 'loading' })
  const [idMissaoSelecionada, setIdMissaoSelecionada] = useState<number | null>(null)
  const [detalheMissao, setDetalheMissao] = useState<EstadoRequisicao<Missao>>({ status: 'idle' })
  const [tentativaLista, setTentativaLista] = useState(0)
  const [tentativaDetalhe, setTentativaDetalhe] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    missaoService
      .listar(controller.signal)
      .then((data) => setMissoes({ status: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setMissoes({
          status: 'error',
          message: error instanceof Error ? error.message : 'Não foi possível carregar as missões.',
        })
      })

    return () => controller.abort()
  }, [tentativaLista])

  useEffect(() => {
    if (idMissaoSelecionada === null) return

    const controller = new AbortController()

    missaoService
      .buscarPorId(idMissaoSelecionada, controller.signal)
      .then((data) => setDetalheMissao({ status: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setDetalheMissao({
          status: 'error',
          message: error instanceof Error ? error.message : 'Não foi possível carregar esta missão.',
        })
      })

    return () => controller.abort()
  }, [idMissaoSelecionada, tentativaDetalhe])

  const abrirDetalhe = (idMissao: number) => {
    setDetalheMissao({ status: 'loading' })
    setIdMissaoSelecionada(idMissao)
    setTentativaDetalhe((atual) => atual + 1)
  }

  const tentarCarregarMissoesNovamente = () => {
    setMissoes({ status: 'loading' })
    setTentativaLista((atual) => atual + 1)
  }

  const tentarCarregarDetalheNovamente = () => {
    setDetalheMissao({ status: 'loading' })
    setTentativaDetalhe((atual) => atual + 1)
  }

  return (
    <main className="min-h-screen bg-[#fbfaf7] text-zinc-900">
      <section className="relative isolate overflow-hidden bg-violet-950 px-5 py-16 text-white sm:py-20 lg:px-8">
        <div aria-hidden="true" className="absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-fuchsia-500/20 blur-3xl" />
        <div aria-hidden="true" className="absolute -bottom-40 left-0 -z-10 h-96 w-96 rounded-full bg-emerald-400/15 blur-3xl" />
        <div className="mx-auto max-w-7xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-violet-100">
            <Leaf aria-hidden="true" className="h-4 w-4" />
            Seu espaço Soulie
          </p>
          <h1 className="mt-6 max-w-3xl text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">
            Pequenas escolhas. Uma jornada que cresce com você.
          </h1>
          <p className="mt-5 max-w-2xl text-base leading-7 text-violet-100/80 sm:text-lg">
            Explore as missões disponíveis e descubra maneiras simples de transformar sustentabilidade em hábito.
          </p>
          <a
            href="#missoes"
            className="mt-8 inline-flex items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-violet-800 shadow-md transition hover:-translate-y-0.5 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
          >
            Explorar missões
            <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
          </a>
        </div>
      </section>

      <section id="missoes" className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-16 lg:py-20">
        <div className="mb-8 flex flex-col gap-3 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Comece por aqui</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-violet-950 sm:text-4xl">Missões disponíveis</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
              Cada missão propõe uma ação prática para levar seus bons hábitos um passo adiante.
            </p>
          </div>
        </div>

        {missoes.status === 'loading' && <LoadingState mensagem="Buscando as missões da Soulie..." />}
        {missoes.status === 'error' && (
          <ErrorState
            mensagem={missoes.message}
            tentarNovamente={tentarCarregarMissoesNovamente}
          />
        )}
        {missoes.status === 'success' && missoes.data.length === 0 && (
          <EmptyState
            titulo="Ainda não há missões disponíveis"
            mensagem="Volte em breve para encontrar novas formas de participar."
          />
        )}
        {missoes.status === 'success' && missoes.data.length > 0 && (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {missoes.data.map((missao) => (
              <article
                key={missao.idMissao}
                className="flex h-full flex-col rounded-3xl border border-violet-100 bg-white p-6 shadow-[0_14px_40px_-30px_rgba(46,16,101,0.42)]"
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
                    {missao.metaDias} {missao.metaDias === 1 ? 'dia' : 'dias'}
                  </span>
                  <span className="rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-800">
                    {missao.pontosRecompensa} pontos
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-bold text-violet-950">{missao.nome}</h3>
                <p className="mt-3 flex-1 text-sm leading-6 text-zinc-600">{missao.descricao}</p>
                <button
                  type="button"
                  onClick={() => abrirDetalhe(missao.idMissao)}
                  className="mt-6 inline-flex w-fit items-center gap-2 rounded-lg px-1 py-2 text-sm font-semibold text-violet-700 transition hover:text-violet-950 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                >
                  Ver detalhes
                  <ArrowUpRight aria-hidden="true" className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        )}

        {idMissaoSelecionada !== null && (
          <section
            aria-live="polite"
            aria-label="Detalhes da missão selecionada"
            className="mt-8 scroll-mt-6 rounded-3xl border border-violet-200 bg-violet-50/70 p-6 sm:p-8"
          >
            {detalheMissao.status === 'loading' && <LoadingState mensagem="Carregando detalhes da missão..." />}
            {detalheMissao.status === 'error' && (
              <ErrorState
                mensagem={detalheMissao.message}
                tentarNovamente={tentarCarregarDetalheNovamente}
              />
            )}
            {detalheMissao.status === 'success' && (
              <div className="mx-auto max-w-3xl">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Detalhes da missão</p>
                    <h3 className="mt-2 text-2xl font-bold text-violet-950">{detalheMissao.data.nome}</h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIdMissaoSelecionada(null)
                      setDetalheMissao({ status: 'idle' })
                    }}
                    className="w-fit rounded-lg border border-violet-200 bg-white px-4 py-2 text-sm font-semibold text-violet-800 transition hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                  >
                    Fechar detalhes
                  </button>
                </div>
                <p className="mt-4 leading-7 text-zinc-700">{detalheMissao.data.descricao}</p>
                <p className="mt-5 text-sm font-semibold text-violet-800">
                  Meta: {detalheMissao.data.metaDias} {detalheMissao.data.metaDias === 1 ? 'dia' : 'dias'}
                  <span aria-hidden="true"> · </span>
                  Recompensa: {detalheMissao.data.pontosRecompensa} pontos
                </p>
              </div>
            )}
          </section>
        )}
      </section>
    </main>
  )
}
