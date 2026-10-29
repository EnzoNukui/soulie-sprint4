import { useEffect, useMemo, useState, type FormEvent } from 'react'
import { Check, Plus, Search, Users, X } from 'lucide-react'
import { useNavigate, useOutletContext } from 'react-router-dom'
import avatarRadiante from '../../assets/avatar/expressoes/avatar_radiante.png'
import avatarSorridente from '../../assets/avatar/expressoes/avatar_sorridente.png'
import soulieApontando from '../../assets/avatar/integrantes/soulie-apontando.png'
import AcaoGuiadaSoulie, { type PassoGuiaSoulie } from '../../components/AcaoGuiadaSoulie/AcaoGuiadaSoulie'
import { guiarParaElemento } from '../../components/AcaoGuiadaSoulie/guiarParaElemento'
import CardComunidade from '../../components/CardComunidade/CardComunidade'
import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import { ApiError } from '../../services/apiClient'
import { comunidadeService } from '../../services/comunidadeService'
import type { Comunidade, Usuario, UsuarioComunidade } from '../../types/api'

const capasComunidade = {
  natureza: 'https://images.unsplash.com/photo-1781785161788-a906202dba8f?auto=format&fit=crop&w=1200&q=80',
  reciclagem: 'https://images.unsplash.com/photo-1771172195332-3bc9ded9f3b5?auto=format&fit=crop&w=1200&q=80',
  mobilidade: 'https://images.unsplash.com/photo-1778513598331-e2c294dcbdd6?auto=format&fit=crop&w=1200&q=80',
  agua: 'https://images.unsplash.com/photo-1773876112010-503345553a7d?auto=format&fit=crop&w=1200&q=80',
  energia: 'https://images.unsplash.com/photo-1761661182058-b718b6676caf?auto=format&fit=crop&w=1200&q=80',
}

const gruposDeInteresse = [
  { nome: 'Mobilidade', termos: ['mobilidade', 'bicicleta', 'bike', 'transporte', 'caminhada'] },
  { nome: 'Reciclagem', termos: ['reciclagem', 'recicl', 'residuo', 'lixo', 'descarte', 'coleta'] },
  { nome: 'Água e oceanos', termos: ['agua', 'oceano', 'mar', 'praia', 'rios'] },
  { nome: 'Natureza e alimentação', termos: ['natureza', 'planta', 'horta', 'jardin', 'aliment', 'compost'] },
  { nome: 'Consumo consciente', termos: ['consumo', 'compra', 'desperdicio', 'reutiliz', 'consciente'] },
  { nome: 'Energia', termos: ['energia', 'solar', 'eolica', 'renovavel', 'ods 7'] },
]

const temasParaCriacao = gruposDeInteresse.map((grupo) => grupo.nome)

function normalizar(texto: string) {
  return texto.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
}

function grupoDaComunidade(comunidade: Comunidade) {
  const texto = normalizar(comunidade.nome + ' ' + comunidade.tema)
  return gruposDeInteresse.find((grupo) => grupo.termos.some((termo) => texto.includes(normalizar(termo))))?.nome ?? 'Outros'
}

function capaDaComunidade(comunidade: Comunidade) {
  const grupo = grupoDaComunidade(comunidade)
  if (grupo === 'Mobilidade') return capasComunidade.mobilidade
  if (grupo === 'Reciclagem') return capasComunidade.reciclagem
  if (grupo === 'Água e oceanos') return capasComunidade.agua
  if (grupo === 'Energia') return capasComunidade.energia
  return capasComunidade.natureza
}

function dataLocal() {
  const agora = new Date()
  const deslocamento = agora.getTimezoneOffset() * 60_000
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 10)
}

function mensagemErro(erro: unknown, padrao: string) {
  return erro instanceof Error ? erro.message : padrao
}

export default function Comunidades() {
  const navigate = useNavigate()
  const usuario = useOutletContext<Usuario>()
  const [comunidades, setComunidades] = useState<Comunidade[]>([])
  const [minhasParticipacoes, setMinhasParticipacoes] = useState<UsuarioComunidade[]>([])
  const [quantidadesMembros, setQuantidadesMembros] = useState<Record<number, number>>({})
  const [idsComunidadesContadas, setIdsComunidadesContadas] = useState('')
  const [carregando, setCarregando] = useState(true)
  const [erro, setErro] = useState('')
  const [tentativa, setTentativa] = useState(0)
  const [busca, setBusca] = useState('')
  const [temaSelecionado, setTemaSelecionado] = useState('Todos')
  const [abrirCriacao, setAbrirCriacao] = useState(false)
  const [criando, setCriando] = useState(false)
  const [nome, setNome] = useState('')
  const [tema, setTema] = useState('')
  const [erroAcao, setErroAcao] = useState('')
  const [aviso, setAviso] = useState('')
  const [idEntrando, setIdEntrando] = useState<number | null>(null)
  const [idSaindo, setIdSaindo] = useState<number | null>(null)

  useEffect(() => {
    document.title = 'Soulie | Comunidades'
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function carregarComunidades() {
      try {
        const lista = await comunidadeService.listar(controller.signal)
        if (controller.signal.aborted) return

        const participacoes = await comunidadeService.listarDoUsuario(usuario.idUsuario, controller.signal)
        if (controller.signal.aborted) return

        setComunidades(lista)
        setMinhasParticipacoes(participacoes)
      } catch (erroCarregamento) {
        if (controller.signal.aborted) return
        setErro(mensagemErro(erroCarregamento, 'Não foi possível carregar as comunidades.'))
      } finally {
        if (!controller.signal.aborted) setCarregando(false)
      }
    }

    void carregarComunidades()
    return () => controller.abort()
  }, [tentativa, usuario.idUsuario])

  useEffect(() => {
    if (comunidades.length === 0) return

    const controller = new AbortController()
    const idsDaLista = comunidades.map((comunidade) => comunidade.idComunidade).sort((a, b) => a - b).join(',')

    async function carregarQuantidades() {
      for (const comunidade of comunidades) {
        if (controller.signal.aborted) return

        try {
          const participantes = await comunidadeService.listarParticipantes(comunidade.idComunidade, controller.signal)
          if (controller.signal.aborted) return
          setQuantidadesMembros((quantidadesAtuais) => ({
            ...quantidadesAtuais,
            [comunidade.idComunidade]: participantes.length,
          }))
        } catch (erro) {
          if (controller.signal.aborted) return
          if (erro instanceof ApiError && erro.status === 404) {
            setQuantidadesMembros((quantidadesAtuais) => ({
              ...quantidadesAtuais,
              [comunidade.idComunidade]: 0,
            }))
          }
        }
      }

      if (controller.signal.aborted) return
      setIdsComunidadesContadas(idsDaLista)
    }

    void carregarQuantidades()
    return () => controller.abort()
  }, [comunidades])

  const idsComunidadesAtuais = comunidades.map((comunidade) => comunidade.idComunidade).sort((a, b) => a - b).join(',')
  const carregandoQuantidades = comunidades.length > 0 && idsComunidadesContadas !== idsComunidadesAtuais

  const participacoesPorComunidade = useMemo(
    () => new Map(minhasParticipacoes.map((participacao) => [participacao.idComunidade, participacao])),
    [minhasParticipacoes],
  )
  const minhasComunidades = useMemo(
    () => comunidades.filter((comunidade) => participacoesPorComunidade.has(comunidade.idComunidade)),
    [comunidades, participacoesPorComunidade],
  )
  const temasDisponiveis = useMemo(
    () => [...new Set(comunidades.map(grupoDaComunidade))].sort((a, b) => a.localeCompare(b, 'pt-BR')),
    [comunidades],
  )

  const comunidadesDisponiveis = comunidades.filter((comunidade) => !participacoesPorComunidade.has(comunidade.idComunidade))
  const interessesAtuais = new Set(minhasComunidades.map(grupoDaComunidade))
  const sugestoesRelacionadas = comunidadesDisponiveis
    .filter((comunidade) => interessesAtuais.has(grupoDaComunidade(comunidade)))
    .slice(0, 3)
  const idsSugestoesRelacionadas = new Set(sugestoesRelacionadas.map((comunidade) => comunidade.idComunidade))
  const todasSugestoes = [
    ...sugestoesRelacionadas,
    ...comunidadesDisponiveis.filter((comunidade) => !idsSugestoesRelacionadas.has(comunidade.idComunidade)),
  ].slice(0, 3)

  const comunidadesVisiveis = useMemo(() => {
    const termo = normalizar(busca.trim())
    return comunidades
      .filter((comunidade) => !participacoesPorComunidade.has(comunidade.idComunidade))
      .filter((comunidade) => temaSelecionado === 'Todos' || grupoDaComunidade(comunidade) === temaSelecionado)
      .filter((comunidade) => !termo || normalizar(comunidade.nome + ' ' + comunidade.tema).includes(termo))
  }, [busca, comunidades, participacoesPorComunidade, temaSelecionado])

  const mensagemSugestoes = sugestoesRelacionadas.length > 0
    ? `Priorizei temas relacionados a “${minhasComunidades[0].nome}” e incluí outras opções para você participar.`
    : 'Separei algumas comunidades para você conhecer. Se alguma combinar com você, participe por aqui mesmo.'
  const temFiltroAtivo = Boolean(busca.trim()) || temaSelecionado !== 'Todos'
  const resultadoDoFiltro = temFiltroAtivo ? comunidadesVisiveis[0] : undefined
  const comunidadeSugerida = resultadoDoFiltro ?? sugestoesRelacionadas[0] ?? comunidadesDisponiveis[0]

  async function participar(comunidade: Comunidade) {
    setIdEntrando(comunidade.idComunidade)
    setErroAcao('')
    setAviso('')

    try {
      const dadosParticipacao = {
        idUsuario: usuario.idUsuario,
        idComunidade: comunidade.idComunidade,
        dataIngresso: dataLocal(),
      }
      const resposta = await comunidadeService.participar(dadosParticipacao)
      const participacao = resposta ?? dadosParticipacao
      setMinhasParticipacoes((atuais) => [
        ...atuais.filter((item) => item.idComunidade !== participacao.idComunidade),
        participacao,
      ])
      setQuantidadesMembros((atuais) => comunidade.idComunidade in atuais
        ? { ...atuais, [comunidade.idComunidade]: atuais[comunidade.idComunidade] + 1 }
        : atuais)
      setAviso('Você entrou na comunidade “' + comunidade.nome + '”.')
    } catch (erroParticipacao) {
      setErroAcao(mensagemErro(erroParticipacao, 'Não foi possível entrar nesta comunidade. Tente novamente.'))
    } finally {
      setIdEntrando(null)
    }
  }

  async function sair(comunidade: Comunidade) {
    setIdSaindo(comunidade.idComunidade)
    setErroAcao('')
    setAviso('')

    try {
      await comunidadeService.sair(usuario.idUsuario, comunidade.idComunidade)
      setMinhasParticipacoes((atuais) => atuais.filter((item) => item.idComunidade !== comunidade.idComunidade))
      setQuantidadesMembros((atuais) => comunidade.idComunidade in atuais
        ? { ...atuais, [comunidade.idComunidade]: Math.max(0, atuais[comunidade.idComunidade] - 1) }
        : atuais)
      setAviso('Você saiu da comunidade “' + comunidade.nome + '”.')
    } catch (erroSaida) {
      setErroAcao(mensagemErro(erroSaida, 'Não foi possível sair desta comunidade. Tente novamente.'))
    } finally {
      setIdSaindo(null)
    }
  }

  async function criarComunidade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!temasParaCriacao.includes(tema)) {
      setErroAcao('Escolha um dos temas disponíveis.')
      return
    }

    setCriando(true)
    setErroAcao('')
    setAviso('')

    try {
      const novaComunidade = await comunidadeService.criar({
        nome: nome.trim(),
        tema: tema.trim(),
      })
      setComunidades((atuais) => [novaComunidade, ...atuais])
      setQuantidadesMembros((atuais) => ({ ...atuais, [novaComunidade.idComunidade]: 0 }))
      setNome('')
      setTema('')
      setAbrirCriacao(false)
      setAviso('Comunidade criada. Você já pode entrar nela e convidar outras pessoas.')
    } catch (erroCriacao) {
      setErroAcao(mensagemErro(erroCriacao, 'Não foi possível criar a comunidade. Tente novamente.'))
    } finally {
      setCriando(false)
    }
  }

  function abrirDetalhes(idComunidade: number) {
    navigate(`/app/comunidades/${idComunidade}`)
  }

  function tentarCarregarNovamente() {
    setCarregando(true)
    setErro('')
    setTentativa((valor) => valor + 1)
  }

  const comunidadeParaGuia = comunidadeSugerida ?? minhasComunidades[0]
  const passosSoulie: PassoGuiaSoulie[] = erro ? [{
    id: 'recarregar', titulo: 'Recarregar grupos', descricao: 'A lista não carregou. Tente novamente.',
    acao: 'Tentar novamente', icone: 'retomar', executar: tentarCarregarNovamente, destaque: true,
  }] : [
    ...(comunidades.length ? [{
      id: 'buscar', titulo: 'Buscar por tema', descricao: 'Digite um nome ou use os filtros.',
      acao: 'Mostrar a busca', icone: 'explorar' as const, executar: () => guiarParaElemento('busca-comunidades'), destaque: true,
    }] : []),
    ...(comunidadeParaGuia ? [{
      id: 'conhecer', titulo: 'Conhecer um grupo', descricao: comunidadeParaGuia.nome,
      acao: 'Abrir comunidade', icone: 'comunidade' as const, executar: () => abrirDetalhes(comunidadeParaGuia.idComunidade),
    }] : []),
    {
      id: 'criar', titulo: 'Criar comunidade', descricao: 'Defina um nome e um tema para seu grupo.',
      acao: 'Abrir formulário', icone: 'criar', executar: () => { setErroAcao(''); setAbrirCriacao(true) }, destaque: comunidades.length === 0,
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Encontre seu espaço</p>
          <h1 className="mt-2 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Comunidades</h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600 sm:text-base">
            Explore grupos, participe de conversas e encontre pessoas que compartilham seus interesses.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative block min-w-0 sm:min-w-64">
            <span className="sr-only">Buscar comunidades</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
            <input id="busca-comunidades" value={busca} onChange={(event) => setBusca(event.target.value)} type="search" placeholder="Buscar comunidades" className="h-11 w-full rounded-xl border border-zinc-200 bg-white pl-10 pr-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
          </label>
          <button type="button" onClick={() => { setErroAcao(''); setAbrirCriacao(true) }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">
            <Plus aria-hidden="true" className="h-4 w-4" /> Criar comunidade
          </button>
        </div>
      </header>

      {aviso && <p role="status" className="mt-5 flex items-start gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-900"><Check aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />{aviso}</p>}
      {erroAcao && !abrirCriacao && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{erroAcao}</p>}

      {!carregando && !erro && todasSugestoes.length > 0 && (
        <section id="sugestoes-soulie" aria-labelledby="titulo-sugestoes-soulie" className="mt-7 rounded-3xl border border-violet-200 bg-gradient-to-r from-violet-50 to-white p-5 sm:p-6">
          <div>
            <div className="flex items-center gap-3">
              <img src={soulieApontando} alt="" className="h-14 w-14 shrink-0 -scale-x-100 object-contain sm:h-16 sm:w-16" />
              <div className="min-w-0 flex-1">
                <h2 id="titulo-sugestoes-soulie" className="text-lg font-bold text-violet-950">Sugestões da Soulie</h2>
                <p className="mt-1 text-sm leading-6 text-zinc-600">{mensagemSugestoes}</p>
              </div>
            </div>
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-3">
              {todasSugestoes.map((comunidade) => (
                <li key={comunidade.idComunidade} className="flex min-w-0 items-center gap-3 rounded-2xl border border-violet-100 bg-white p-3">
                  <img src={capaDaComunidade(comunidade)} alt="" loading="lazy" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} className="h-12 w-12 shrink-0 rounded-xl bg-violet-100 object-cover" />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-bold text-zinc-900">{comunidade.nome}</p>
                    <p className="truncate text-xs text-zinc-500">{comunidade.tema}</p>
                    <p className="mt-1 inline-flex items-center gap-1 text-[11px] text-zinc-500"><Users aria-hidden="true" className="h-3 w-3" />{quantidadesMembros[comunidade.idComunidade] !== undefined ? `${quantidadesMembros[comunidade.idComunidade]} ${quantidadesMembros[comunidade.idComunidade] === 1 ? 'membro' : 'membros'}` : carregandoQuantidades ? 'Carregando membros...' : 'Membros indisponíveis'}</p>
                  </div>
                  <button type="button" onClick={() => void participar(comunidade)} disabled={idEntrando !== null} className="shrink-0 rounded-lg px-2 py-2 text-xs font-bold text-violet-700 transition hover:bg-violet-50 disabled:opacity-50">
                    {idEntrando === comunidade.idComunidade ? 'Entrando...' : 'Participar'}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {!carregando && !erro && minhasComunidades.length > 0 && (
        <section aria-labelledby="titulo-minhas-comunidades" className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <h2 id="titulo-minhas-comunidades" className="text-xl font-bold text-zinc-950">Minhas comunidades</h2>
              <p className="mt-1 text-sm text-zinc-600">Os espaços em que você já participa.</p>
            </div>
            <span className="text-sm font-semibold text-violet-800">{minhasComunidades.length}</span>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {minhasComunidades.map((comunidade) => (
              <li key={comunidade.idComunidade}>
                <CardComunidade
                  comunidade={comunidade}
                  capa={capaDaComunidade(comunidade)}
                  quantidadeMembros={quantidadesMembros[comunidade.idComunidade]}
                  carregandoMembros={carregandoQuantidades}
                  participacao={participacoesPorComunidade.get(comunidade.idComunidade)}
                  entrando={false}
                  saindo={idSaindo === comunidade.idComunidade}
                  abrir={() => abrirDetalhes(comunidade.idComunidade)}
                  entrar={() => void participar(comunidade)}
                  sair={() => void sair(comunidade)}
                />
              </li>
            ))}
          </ul>
        </section>
      )}

      <section id={minhasComunidades.length > 0 ? 'descobrir-comunidades' : 'lista-comunidades'} aria-labelledby="titulo-descobrir-comunidades" className="mt-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">{minhasComunidades.length > 0 ? 'Amplie seu círculo' : 'Para começar'}</p>
            <h2 id="titulo-descobrir-comunidades" className="mt-1 text-xl font-bold text-zinc-950">{minhasComunidades.length > 0 ? 'Descubra outras comunidades' : 'Encontre sua comunidade'}</h2>
            <p className="mt-1 text-sm text-zinc-600">{minhasComunidades.length > 0 ? 'Explore temas diferentes ou encontre grupos relacionados aos seus interesses.' : 'Escolha um tema que combine com você e participe.'}</p>
          </div>
          <span className="text-sm text-zinc-500">{comunidadesVisiveis.length} {comunidadesVisiveis.length === 1 ? 'comunidade' : 'comunidades'}</span>
        </div>

        {!carregando && !erro && temasDisponiveis.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-2" aria-label="Filtrar por tema">
            {['Todos', ...temasDisponiveis].map((temaFiltro) => (
              <button key={temaFiltro} type="button" aria-pressed={temaSelecionado === temaFiltro} onClick={() => setTemaSelecionado(temaFiltro)} className={temaSelecionado === temaFiltro
                ? 'shrink-0 rounded-full bg-violet-600 px-4 py-2 text-sm font-semibold text-white'
                : 'shrink-0 rounded-full border border-zinc-200 bg-white px-4 py-2 text-sm font-semibold text-zinc-600 transition hover:border-violet-200 hover:text-violet-800'}
              >
                {temaFiltro}
              </button>
            ))}
          </div>
        )}

        <div className="mt-5">
          {carregando && <LoadingState mensagem="Carregando comunidades..." />}
          {!carregando && erro && <ErrorState mensagem={erro} tentarNovamente={tentarCarregarNovamente} />}
          {!carregando && !erro && comunidadesVisiveis.length === 0 && (
            <EmptyState
              titulo={busca || temaSelecionado !== 'Todos' ? 'Nenhuma comunidade encontrada' : minhasComunidades.length > 0 ? 'Você já participa de todas as comunidades' : 'Ainda não há comunidades disponíveis'}
              mensagem={busca || temaSelecionado !== 'Todos' ? 'Tente outro nome ou tema para encontrar grupos.' : 'Crie uma comunidade para convidar outras pessoas a participar.'}
            />
          )}
          {!carregando && !erro && comunidadesVisiveis.length > 0 && (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {comunidadesVisiveis.map((comunidade) => (
                <li key={comunidade.idComunidade}>
                  <CardComunidade
                    comunidade={comunidade}
                    capa={capaDaComunidade(comunidade)}
                    quantidadeMembros={quantidadesMembros[comunidade.idComunidade]}
                    carregandoMembros={carregandoQuantidades}
                    entrando={idEntrando === comunidade.idComunidade}
                    saindo={false}
                    abrir={() => abrirDetalhes(comunidade.idComunidade)}
                    entrar={() => void participar(comunidade)}
                    sair={() => void sair(comunidade)}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {abrirCriacao && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/40 p-4" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget && !criando) setAbrirCriacao(false)
        }}>
          <section role="dialog" aria-modal="true" aria-labelledby="titulo-criar-comunidade" className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl border border-violet-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Junte pessoas com os mesmos interesses</p>
                <h2 id="titulo-criar-comunidade" className="mt-2 text-2xl font-black text-zinc-950">Criar comunidade</h2>
                <p className="mt-2 text-sm leading-6 text-zinc-600">Defina um nome e escolha um tema para o grupo. A capa acompanha o tema e usa uma imagem externa.</p>
              </div>
              <button type="button" onClick={() => setAbrirCriacao(false)} disabled={criando} aria-label="Fechar formulário" className="rounded-lg p-2 text-zinc-500 transition hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(event) => void criarComunidade(event)} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-zinc-800">
                Nome da comunidade
                <input autoFocus value={nome} onChange={(event) => setNome(event.target.value)} required maxLength={100} className="mt-2 h-11 w-full rounded-xl border border-zinc-300 px-3 font-normal outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" placeholder="Ex.: Mobilidade no dia a dia" />
              </label>
              <label className="block text-sm font-semibold text-zinc-800">
                Tema
                <select value={tema} onChange={(event) => setTema(event.target.value)} required className="mt-2 h-11 w-full rounded-xl border border-zinc-300 bg-white px-3 font-normal outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100">
                  <option value="" disabled>Selecione um tema</option>
                  {temasParaCriacao.map((temaDisponivel) => <option key={temaDisponivel} value={temaDisponivel}>{temaDisponivel}</option>)}
                </select>
              </label>
              {erroAcao && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{erroAcao}</p>}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setAbrirCriacao(false)} disabled={criando} className="min-h-11 rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={criando} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-60">
                  {criando ? 'Criando...' : 'Criar comunidade'} <Plus aria-hidden="true" className="h-4 w-4" />
                </button>
              </div>
            </form>
          </section>
        </div>
      )}

      <AcaoGuiadaSoulie
        imagem={comunidadeSugerida ? avatarRadiante : avatarSorridente}
        titulo="Explore os grupos"
        passos={passosSoulie}
        carregando={carregando}
      />
    </main>
  )
}
