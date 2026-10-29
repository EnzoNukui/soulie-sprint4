import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { ArrowRight, CalendarDays, Check, CircleCheck, Flame, Plus, Target, X } from 'lucide-react'
import { useOutletContext } from 'react-router-dom'
import avatarRadiante from '../../assets/avatar/expressoes/avatar_radiante.png'
import avatarSorridente from '../../assets/avatar/expressoes/avatar_sorridente.png'
import AcaoGuiadaSoulie, { type PassoGuiaSoulie } from '../../components/AcaoGuiadaSoulie/AcaoGuiadaSoulie'
import { guiarParaElemento } from '../../components/AcaoGuiadaSoulie/guiarParaElemento'
import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import ProgressoMissao from '../../components/ProgressoMissao/ProgressoMissao'
import { atividadeService } from '../../services/atividadeService'
import { missaoService } from '../../services/missaoService'
import { streakService } from '../../services/streakService'
import type { Atividade, Missao, Streak, Usuario, UsuarioMissao } from '../../types/api'

type FiltroMissoes = 'todas' | 'disponiveis' | 'andamento' | 'concluidas'

const filtros: { id: FiltroMissoes; rotulo: string }[] = [
  { id: 'todas', rotulo: 'Todas' },
  { id: 'disponiveis', rotulo: 'Disponíveis' },
  { id: 'andamento', rotulo: 'Em andamento' },
  { id: 'concluidas', rotulo: 'Concluídas' },
]

function dataLocal() {
  const agora = new Date()
  const deslocamento = agora.getTimezoneOffset() * 60_000
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 10)
}

function dataAtualDeSaoPaulo() {
  const partes = new Intl.DateTimeFormat('en', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
  }).formatToParts(new Date())
  const valores = Object.fromEntries(partes.map((parte) => [parte.type, parte.value]))
  return `${valores.year}-${valores.month}-${valores.day}`
}

function formatarData(data: string) {
  const valor = new Date(data + 'T00:00:00')
  if (Number.isNaN(valor.getTime())) return data
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(valor)
}

function mensagemErro(erro: unknown, padrao: string) {
  return erro instanceof Error ? erro.message : padrao
}

export default function MissoesApp() {
  const usuario = useOutletContext<Usuario>()
  const [missoes, setMissoes] = useState<Missao[]>([])
  const [participacoes, setParticipacoes] = useState<UsuarioMissao[]>([])
  const [atividades, setAtividades] = useState<Atividade[]>([])
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [tentativaDetalhe, setTentativaDetalhe] = useState(0)
  const [filtro, setFiltro] = useState<FiltroMissoes>('todas')
  const [idMissaoSelecionada, setIdMissaoSelecionada] = useState<number | null>(null)
  const [detalhe, setDetalhe] = useState<{ status: 'idle' | 'loading' | 'error' | 'success'; data?: Missao; message?: string }>({ status: 'idle' })
  const [abrirCriacao, setAbrirCriacao] = useState(false)
  const [criando, setCriando] = useState(false)
  const [entrandoNaMissao, setEntrandoNaMissao] = useState<number | null>(null)
  const [registrandoAtividade, setRegistrandoAtividade] = useState<number | null>(null)
  const [streakAtualizada, setStreakAtualizada] = useState<Streak | null>(null)
  const [erroRegistro, setErroRegistro] = useState('')
  const [avisoRegistro, setAvisoRegistro] = useState('')
  const [erroAcao, setErroAcao] = useState('')
  const [aviso, setAviso] = useState('')
  const [nome, setNome] = useState('')
  const [descricao, setDescricao] = useState('')
  const [metaDias, setMetaDias] = useState('7')
  const [pontos, setPontos] = useState('50')

  useEffect(() => {
    document.title = 'Soulie | Missões'
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function carregarMissoes() {
      try {
        const [lista, listaParticipacoes, listaAtividades] = await Promise.all([
          missaoService.listar(controller.signal),
          missaoService.listarParticipacoesDoUsuario(usuario.idUsuario, controller.signal),
          atividadeService.listarDoUsuario(usuario.idUsuario, controller.signal),
        ])
        if (controller.signal.aborted) return

        setMissoes(lista)
        setParticipacoes(listaParticipacoes)
        setAtividades(listaAtividades)
      } catch (erroCarregamento) {
        if (controller.signal.aborted) return
        setErro(mensagemErro(erroCarregamento, 'Não foi possível carregar as missões.'))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }

    void carregarMissoes()
    return () => controller.abort()
  }, [tentativa, usuario.idUsuario])

  useEffect(() => {
    if (idMissaoSelecionada === null) {
      return
    }

    const controller = new AbortController()

    missaoService
      .buscarPorId(idMissaoSelecionada, controller.signal)
      .then((data) => setDetalhe({ status: 'success', data }))
      .catch((erroDetalhe: unknown) => {
        if (controller.signal.aborted) return
        setDetalhe({
          status: 'error',
          message: mensagemErro(erroDetalhe, 'Não foi possível carregar os detalhes desta missão.'),
        })
      })

    return () => controller.abort()
  }, [idMissaoSelecionada, tentativaDetalhe])

  const participacoesPorMissao = useMemo(
    () => new Map(participacoes.map((participacao) => [participacao.idMissao, participacao])),
    [participacoes],
  )
  const diasAtividadePorMissao = useMemo(() => {
    const datas = new Map<number, Set<string>>()
    for (const atividade of atividades) {
      const datasDaMissao = datas.get(atividade.idMissao) ?? new Set<string>()
      datasDaMissao.add(atividade.dataRegistro)
      datas.set(atividade.idMissao, datasDaMissao)
    }
    return datas
  }, [atividades])
  const missoesDisponiveis = missoes.filter((missao) => !participacoesPorMissao.has(missao.idMissao))
  const missoesEmAndamento = participacoes.filter((participacao) => participacao.status === 'EM_ANDAMENTO').length
  const missoesConcluidas = participacoes.filter((participacao) => participacao.status === 'CONCLUIDA').length
  const missoesFiltradas = useMemo(() => missoes.filter((missao) => {
    const participacao = participacoesPorMissao.get(missao.idMissao)
    if (filtro === 'disponiveis') return !participacao
    if (filtro === 'andamento') return participacao?.status === 'EM_ANDAMENTO'
    if (filtro === 'concluidas') return participacao?.status === 'CONCLUIDA'
    return true
  }), [filtro, missoes, participacoesPorMissao])

  const missaoSugerida = missoes.find((missao) => participacoesPorMissao.get(missao.idMissao)?.status !== 'CONCLUIDA')
  const missaoEmAndamento = missoes.find((missao) => participacoesPorMissao.get(missao.idMissao)?.status === 'EM_ANDAMENTO')

  async function entrarNaMissao(missao: Missao) {
    setEntrandoNaMissao(missao.idMissao)
    setErroAcao('')
    setAviso('')

    try {
      const participacao = await missaoService.participar({
        idUsuario: usuario.idUsuario,
        idMissao: missao.idMissao,
        dataInicio: dataLocal(),
      })
      setParticipacoes((atuais) => [
        ...atuais.filter((item) => item.idMissao !== participacao.idMissao),
        participacao,
      ])
      setAviso('Você começou a missão “' + missao.nome + '”.')
    } catch (erroEntrada) {
      setErroAcao(mensagemErro(erroEntrada, 'Não foi possível iniciar esta missão. Tente novamente.'))
    } finally {
      setEntrandoNaMissao(null)
    }
  }

  async function confirmarAcaoDoDia(missao: Missao) {
    setRegistrandoAtividade(missao.idMissao)
    setErroRegistro('')
    setAvisoRegistro('')
    setStreakAtualizada(null)

    try {
      const atividade = await atividadeService.registrar({
        idUsuario: usuario.idUsuario,
        idMissao: missao.idMissao,
        observacao: 'Ação diária confirmada pelo usuário.',
      })
      setAtividades((atuais) => [...atuais.filter((item) => item.idRegistro !== atividade.idRegistro), atividade])
      setAvisoRegistro('Ação de hoje confirmada. Seu progresso foi atualizado.')

      const [participacaoResultado, streakResultado] = await Promise.allSettled([
        missaoService.buscarParticipacao(usuario.idUsuario, missao.idMissao),
        streakService.buscarPorUsuario(usuario.idUsuario),
      ])

      const errosAtualizacao: string[] = []
      if (participacaoResultado.status === 'fulfilled') {
        const participacaoAtualizada = participacaoResultado.value
        setParticipacoes((atuais) => [
          ...atuais.filter((item) => item.idMissao !== participacaoAtualizada.idMissao),
          participacaoAtualizada,
        ])
      } else errosAtualizacao.push('o status da missão')

      if (streakResultado.status === 'fulfilled') {
        setStreakAtualizada(streakResultado.value)
      } else errosAtualizacao.push('a streak')
      if (errosAtualizacao.length > 0) {
        setErroRegistro(`A ação foi salva, mas não conseguimos atualizar ${errosAtualizacao.join(' e ')} agora. Os dados serão consultados novamente ao abrir esta tela.`)
      }
    } catch (erroAtividade) {
      try {
        const atividadesAtualizadas = await atividadeService.listarDoUsuario(usuario.idUsuario)
        setAtividades(atividadesAtualizadas)
        if (atividadesAtualizadas.some((item) => item.idMissao === missao.idMissao && item.dataRegistro === dataAtualDeSaoPaulo())) {
          setAvisoRegistro('A ação desta missão já foi confirmada hoje.')
          const [participacaoResultado, streakResultado] = await Promise.allSettled([
            missaoService.buscarParticipacao(usuario.idUsuario, missao.idMissao),
            streakService.buscarPorUsuario(usuario.idUsuario),
          ])
          if (participacaoResultado.status === 'fulfilled') {
            const participacaoAtualizada = participacaoResultado.value
            setParticipacoes((atuais) => [
              ...atuais.filter((item) => item.idMissao !== participacaoAtualizada.idMissao),
              participacaoAtualizada,
            ])
          }
          if (streakResultado.status === 'fulfilled') setStreakAtualizada(streakResultado.value)
          return
        }
      } catch {
        // Mantém a mensagem de erro da gravação original como referência para a pessoa.
      }
      setErroRegistro(mensagemErro(erroAtividade, 'Não foi possível confirmar a ação de hoje. Tente novamente.'))
    } finally {
      setRegistrandoAtividade(null)
    }
  }

  async function criarMissao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCriando(true)
    setErroAcao('')
    setAviso('')

    try {
      const novaMissao = await missaoService.criar({
        nome: nome.trim(),
        descricao: descricao.trim(),
        metaDias: Number(metaDias),
        pontosRecompensa: Number(pontos),
        idUsuarioCriador: usuario.idUsuario,
      })
      setMissoes((atuais) => [novaMissao, ...atuais])
      setFiltro('todas')
      setNome('')
      setDescricao('')
      setMetaDias('7')
      setPontos('50')
      setAbrirCriacao(false)
      setAviso('Sua missão foi cadastrada e já está disponível para a comunidade.')
    } catch (erroCriacao) {
      setErroAcao(mensagemErro(erroCriacao, 'Não foi possível cadastrar a missão. Tente novamente.'))
    } finally {
      setCriando(false)
    }
  }

  function abrirDetalhes(idMissao: number) {
    setDetalhe({ status: 'loading' })
    setErroRegistro('')
    setAvisoRegistro('')
    setStreakAtualizada(null)
    setIdMissaoSelecionada(idMissao)
  }

  function fecharDetalhes() {
    setIdMissaoSelecionada(null)
    setDetalhe({ status: 'idle' })
    setErroRegistro('')
    setAvisoRegistro('')
    setStreakAtualizada(null)
  }

  function tentarCarregarMissoesNovamente() {
    setCarregando(true)
    setErro('')
    setTentativa((valor) => valor + 1)
  }

  const missaoParaGuia = missaoEmAndamento ?? missaoSugerida ?? missoes[0]
  const passosSoulie: PassoGuiaSoulie[] = erro ? [{
    id: 'recarregar', titulo: 'Recarregar missões', descricao: 'A lista não carregou. Tente novamente.',
    acao: 'Tentar novamente', icone: 'retomar', executar: tentarCarregarMissoesNovamente, destaque: true,
  }] : [
    ...(missoes.length ? [{
      id: 'explorar', titulo: 'Explorar missões', descricao: 'Use as abas para filtrar os desafios.',
      acao: 'Mostrar as missões', icone: 'explorar' as const, executar: () => guiarParaElemento('lista-missoes', 'titulo-lista-missoes'), destaque: !missaoEmAndamento,
    }] : []),
    ...(missaoParaGuia ? [{
      id: 'detalhe', titulo: missaoEmAndamento ? 'Registrar ação de hoje' : missaoSugerida ? 'Ver como começar' : 'Ver conquista',
      descricao: missaoEmAndamento ? 'Confirme a ação depois de fazer o desafio.' : 'Confira a meta e os pontos da missão.',
      acao: missaoEmAndamento ? 'Abrir minha missão' : 'Ver detalhe da missão', icone: 'missao' as const,
      executar: () => abrirDetalhes(missaoParaGuia.idMissao), destaque: Boolean(missaoEmAndamento),
    }] : []),
    {
      id: 'criar', titulo: 'Criar missão', descricao: 'Escolha uma ação, uma meta e os pontos.',
      acao: 'Criar uma missão', icone: 'criar', executar: () => { setErroAcao(''); setAbrirCriacao(true) }, destaque: missoes.length === 0,
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Sua jornada</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Missões</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Escolha um desafio, acompanhe sua jornada e compartilhe novas ideias com a comunidade.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            setErroAcao('')
            setAbrirCriacao(true)
          }}
          className="inline-flex min-h-11 w-fit items-center justify-center gap-2 rounded-xl border border-violet-200 bg-white px-4 py-2.5 text-sm font-bold text-violet-800 transition hover:border-violet-300 hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          <Plus aria-hidden="true" className="h-4 w-4" />
          Criar missão
        </button>
      </header>

      <section aria-label="Resumo das missões" className="mt-7 grid grid-cols-2 gap-3 sm:max-w-xl">
        <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3">
          <p className="text-xs font-medium text-zinc-500">Disponíveis</p>
          <p className="mt-1 text-xl font-black text-violet-800">{missoesDisponiveis.length}</p>
        </div>
        <div className="rounded-2xl border border-violet-100 bg-white px-4 py-3">
          <p className="text-xs font-medium text-zinc-500">Em andamento</p>
          <p className="mt-1 text-xl font-black text-violet-800">{missoesEmAndamento}</p>
        </div>
      </section>

      {aviso && (
        <p role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900">
          <Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
          {aviso}
        </p>
      )}
      {erroAcao && !abrirCriacao && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{erroAcao}</p>}

      {missoesConcluidas > 0 && (
        <section aria-label="Missões concluídas" className="mt-5 flex items-center gap-3 rounded-2xl border border-violet-100 bg-violet-50/70 px-4 py-3">
          <img src={avatarRadiante} alt="" className="h-12 w-12 shrink-0 object-contain" />
          <div>
            <p className="text-sm font-bold text-violet-950">Parabéns pela sua jornada!</p>
            <p className="mt-0.5 text-sm text-zinc-600">
              {missoesConcluidas} {missoesConcluidas === 1 ? 'missão concluída' : 'missões concluídas'} até agora.
            </p>
          </div>
        </section>
      )}

      <section id="lista-missoes" aria-labelledby="titulo-lista-missoes" className="mt-8">
        <div className="flex flex-col gap-4 border-b border-zinc-200 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 id="titulo-lista-missoes" className="text-xl font-bold text-zinc-950">Encontre sua próxima missão</h2>
            <p className="mt-1 text-sm text-zinc-600">{missoes.length} {missoes.length === 1 ? 'missão cadastrada' : 'missões cadastradas'}</p>
          </div>
          <div role="tablist" aria-label="Filtrar missões" className="-mb-px flex flex-wrap gap-x-5 gap-y-2">
            {filtros.map((item) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={filtro === item.id}
                onClick={() => setFiltro(item.id)}
                className={filtro === item.id
                  ? 'shrink-0 border-b-2 border-violet-600 px-1 pb-3 text-sm font-semibold text-violet-700 transition'
                  : 'shrink-0 border-b-2 border-transparent px-1 pb-3 text-sm font-semibold text-zinc-500 transition hover:text-zinc-800'}
              >
                {item.rotulo}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          {carregando && <LoadingState mensagem="Carregando as missões..." />}
          {!carregando && erro && <ErrorState mensagem={erro} tentarNovamente={tentarCarregarMissoesNovamente} />}
          {!carregando && !erro && missoesFiltradas.length === 0 && (
            <EmptyState
              titulo={filtro === 'disponiveis' ? 'Você já começou todas as missões' : filtro === 'concluidas' ? 'Ainda não há missões concluídas' : filtro === 'andamento' ? 'Nenhuma missão em andamento' : 'Ainda não há missões disponíveis'}
              mensagem={filtro === 'disponiveis' ? 'Volte em breve para encontrar novos desafios.' : filtro === 'concluidas' ? 'Suas missões concluídas aparecerão aqui.' : filtro === 'andamento' ? 'Escolha uma missão disponível para começar sua jornada.' : 'Volte em breve para encontrar novas formas de participar.'}
            />
          )}
          {!carregando && !erro && missoesFiltradas.length > 0 && (
            <ul className="divide-y divide-zinc-200 rounded-2xl border border-zinc-200 bg-white">
              {missoesFiltradas.map((missao) => {
                const participacao = participacoesPorMissao.get(missao.idMissao)
                const concluida = participacao?.status === 'CONCLUIDA'
                const emAndamento = participacao?.status === 'EM_ANDAMENTO'
                const diasConcluidos = diasAtividadePorMissao.get(missao.idMissao)?.size ?? 0

                return (
                  <li key={missao.idMissao} className="flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-center md:gap-6">
                    <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-2xl bg-violet-50 text-violet-800">
                      <span className="text-base font-black">+{missao.pontosRecompensa}</span>
                      <span className="text-[10px] font-semibold uppercase tracking-wide">pontos</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-base font-bold text-zinc-950 sm:text-lg">{missao.nome}</h3>
                        {concluida && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800">
                            <CircleCheck aria-hidden="true" className="h-3.5 w-3.5" />
                            Concluída
                          </span>
                        )}
                        {emAndamento && <span className="rounded-full bg-violet-50 px-2.5 py-1 text-xs font-semibold text-violet-800">Em andamento</span>}
                      </div>
                      <p className="mt-1 line-clamp-2 text-sm leading-6 text-zinc-600">{missao.descricao}</p>
                      <p className="mt-2 inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500">
                        <Target aria-hidden="true" className="h-3.5 w-3.5 text-violet-600" />
                        Meta: {missao.metaDias} {missao.metaDias === 1 ? 'dia' : 'dias'}
                        {participacao && <><span aria-hidden="true">·</span><CalendarDays aria-hidden="true" className="h-3.5 w-3.5" /> Iniciada em {formatarData(participacao.dataInicio)}</>}
                      </p>
                      {emAndamento && <ProgressoMissao diasConcluidos={diasConcluidos} metaDias={missao.metaDias} />}
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row md:flex-col lg:flex-row">
                      <button
                        type="button"
                        onClick={() => abrirDetalhes(missao.idMissao)}
                        className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-semibold text-violet-700 transition hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
                      >
                        {emAndamento ? 'Continuar' : 'Ver detalhes'} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                      </button>
                      {!participacao && (
                        <button
                          type="button"
                          onClick={() => void entrarNaMissao(missao)}
                          disabled={entrandoNaMissao !== null}
                          className="inline-flex min-h-10 items-center justify-center rounded-xl bg-violet-600 px-5 py-2 text-sm font-bold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-60"
                        >
                          {entrandoNaMissao === missao.idMissao ? 'Iniciando...' : 'Começar'}
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </div>
      </section>

      {idMissaoSelecionada !== null && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) fecharDetalhes()
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-detalhe-missao" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-violet-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Detalhes da missão</p>
                {detalhe.status === 'success' && <h2 id="titulo-detalhe-missao" className="mt-2 text-2xl font-black text-zinc-950">{detalhe.data?.nome}</h2>}
                {detalhe.status !== 'success' && <h2 id="titulo-detalhe-missao" className="sr-only">Detalhes da missão selecionada</h2>}
              </div>
              <button autoFocus type="button" onClick={fecharDetalhes} aria-label="Fechar detalhes" className="rounded-lg p-2 text-zinc-500 transition hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>

            {detalhe.status === 'loading' && <div className="mt-5"><LoadingState mensagem="Carregando detalhes da missão..." /></div>}
            {detalhe.status === 'error' && <div className="mt-5"><ErrorState mensagem={detalhe.message ?? 'Não foi possível carregar os detalhes.'} tentarNovamente={() => { setDetalhe({ status: 'loading' }); setTentativaDetalhe((valor) => valor + 1) }} /></div>}
            {detalhe.status === 'success' && detalhe.data && (
              <>
                <p className="mt-4 leading-7 text-zinc-600">{detalhe.data.descricao}</p>
                <div className="mt-6 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl bg-violet-50 p-4">
                    <p className="text-xs font-medium text-zinc-500">Meta</p>
                    <p className="mt-1 font-bold text-violet-900">{detalhe.data.metaDias} {detalhe.data.metaDias === 1 ? 'dia' : 'dias'}</p>
                  </div>
                  <div className="rounded-2xl bg-violet-50 p-4">
                    <p className="text-xs font-medium text-zinc-500">Recompensa</p>
                    <p className="mt-1 font-bold text-violet-900">{detalhe.data.pontosRecompensa} pontos</p>
                  </div>
                </div>
                {participacoesPorMissao.has(detalhe.data.idMissao) && (
                  <ProgressoMissao
                    diasConcluidos={diasAtividadePorMissao.get(detalhe.data.idMissao)?.size ?? 0}
                    metaDias={detalhe.data.metaDias}
                  />
                )}
                {participacoesPorMissao.get(detalhe.data.idMissao)?.status === 'EM_ANDAMENTO' ? (
                  <div className="mt-5 space-y-3">
                    {diasAtividadePorMissao.get(detalhe.data.idMissao)?.has(dataAtualDeSaoPaulo()) ? (
                      <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">
                        Ação de hoje registrada. Você pode confirmar uma nova ação amanhã.
                      </p>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void confirmarAcaoDoDia(detalhe.data as Missao)}
                        disabled={registrandoAtividade !== null}
                        className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-60 sm:w-auto"
                      >
                        {registrandoAtividade === detalhe.data.idMissao ? 'Registrando...' : 'Confirmar ação de hoje'}
                        <Check aria-hidden="true" className="h-4 w-4" />
                      </button>
                    )}
                    {avisoRegistro && <p role="status" className="text-sm font-medium text-emerald-800">{avisoRegistro}</p>}
                    {streakAtualizada && (
                      <p className="inline-flex items-center gap-2 rounded-xl bg-orange-50 px-4 py-3 text-sm font-semibold text-orange-800">
                        <Flame aria-hidden="true" className="h-4 w-4" /> Streak atualizada: {streakAtualizada.diasConsecutivos} {streakAtualizada.diasConsecutivos === 1 ? 'dia' : 'dias'}
                      </p>
                    )}
                    {erroRegistro && <p role="alert" className="text-sm font-medium text-rose-700">{erroRegistro}</p>}
                  </div>
                ) : participacoesPorMissao.get(detalhe.data.idMissao)?.status === 'CONCLUIDA' ? (
                  <p className="mt-5 rounded-xl bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700">
                    Missão concluída. Parabéns pelo seu progresso!
                  </p>
                ) : (
                  <button
                    type="button"
                    onClick={() => void entrarNaMissao(detalhe.data as Missao)}
                    disabled={entrandoNaMissao !== null}
                    className="mt-6 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-3 text-sm font-bold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-60 sm:w-auto"
                  >
                    {entrandoNaMissao === detalhe.data.idMissao ? 'Iniciando...' : 'Começar missão'} <ArrowRight aria-hidden="true" className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </section>
        </div>
      )}

      {abrirCriacao && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/40 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !criando) setAbrirCriacao(false)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-criar-missao" className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-violet-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Compartilhe um desafio</p>
                <h2 id="titulo-criar-missao" className="mt-2 text-2xl font-black text-zinc-950">Criar missão</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">Proponha uma ação que ajude outras pessoas a desenvolver hábitos sustentáveis.</p>
              </div>
              <button type="button" onClick={() => setAbrirCriacao(false)} disabled={criando} aria-label="Fechar formulário" className="rounded-lg p-2 text-zinc-500 transition hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(event) => void criarMissao(event)} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-zinc-800">
                Nome da missão
                <input autoFocus value={nome} onChange={(event) => setNome(event.target.value)} required maxLength={100} className="mt-2 h-11 w-full rounded-xl border border-zinc-300 px-3 font-normal outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" placeholder="Ex.: Leve sua própria garrafa" />
              </label>
              <label className="block text-sm font-semibold text-zinc-800">
                Descrição
                <textarea value={descricao} onChange={(event) => setDescricao(event.target.value)} required maxLength={500} rows={3} className="mt-2 w-full resize-y rounded-xl border border-zinc-300 px-3 py-2.5 font-normal outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" placeholder="Explique o desafio para a comunidade" />
              </label>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="block text-sm font-semibold text-zinc-800">
                  Meta em dias
                  <input type="number" value={metaDias} onChange={(event) => setMetaDias(event.target.value)} required min="1" max="365" className="mt-2 h-11 w-full rounded-xl border border-zinc-300 px-3 font-normal outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
                </label>
                <label className="block text-sm font-semibold text-zinc-800">
                  Pontos de recompensa
                  <input type="number" value={pontos} onChange={(event) => setPontos(event.target.value)} required min="1" max="10000" className="mt-2 h-11 w-full rounded-xl border border-zinc-300 px-3 font-normal outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
                </label>
              </div>
              {erroAcao && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{erroAcao}</p>}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setAbrirCriacao(false)} disabled={criando} className="min-h-11 rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={criando} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-60">
                  {criando ? 'Cadastrando...' : 'Cadastrar missão'} <Plus aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <AcaoGuiadaSoulie
        imagem={missoesConcluidas > 0 ? avatarRadiante : avatarSorridente}
        titulo="Avance nas missões"
        passos={passosSoulie}
        carregando={carregando}
      />
    </main>
  )
}
