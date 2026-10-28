import { useEffect, useMemo, useState } from 'react'
import { ArrowRight, Flame, MessageCircle, Send, Star, TrendingUp } from 'lucide-react'
import { Link, useNavigate, useOutletContext } from 'react-router-dom'
import avatarDuvida from '../../assets/avatar/expressoes/avatar_duvida.png'
import avatarRadiante from '../../assets/avatar/expressoes/avatar_radiante.png'
import avatarSorridente from '../../assets/avatar/expressoes/avatar_sorridente.png'
import AcoesPublicacao from '../../components/AcoesPublicacao/AcoesPublicacao'
import AcaoGuiadaSoulie from '../../components/AcaoGuiadaSoulie/AcaoGuiadaSoulie'
import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import { avatarService } from '../../services/avatarService'
import { comunidadeService } from '../../services/comunidadeService'
import { missaoService } from '../../services/missaoService'
import { postagemService } from '../../services/postagemService'
import { streakService } from '../../services/streakService'
import { usuarioService } from '../../services/usuarioService'
import type { Avatar, Comunidade, Postagem, Streak, Usuario, UsuarioComunidade, UsuarioMissao } from '../../types/api'

type AbaFeed = 'para-voce' | 'comunidades'

function nomeCurto(nome: string) {
  return nome.trim().split(/\s+/)[0] || 'pessoa'
}

function formatarData(data: string) {
  const valor = new Date(data)
  if (Number.isNaN(valor.getTime())) return 'Data indisponível'
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(valor)
}

function dataHoraLocal() {
  const agora = new Date()
  const deslocamento = agora.getTimezoneOffset() * 60_000
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 19)
}

function textoDeErro(erro: unknown, padrao: string) {
  return erro instanceof Error ? erro.message : padrao
}

function ehNaoEncontrado(erro: unknown) {
  return typeof erro === 'object' && erro !== null && 'status' in erro && erro.status === 404
}

async function executarConsulta<T>(consulta: () => Promise<T>): Promise<PromiseSettledResult<T>> {
  try {
    return { status: 'fulfilled', value: await consulta() }
  } catch (reason) {
    return { status: 'rejected', reason }
  }
}

export default function InicioApp() {
  const navigate = useNavigate()
  const usuario = useOutletContext<Usuario>()
  const [carregando, setCarregando] = useState(true)
  const [tentativa, setTentativa] = useState(0)
  const [streak, setStreak] = useState<Streak | null>(null)
  const [avatar, setAvatar] = useState<Avatar | null>(null)
  const [participacoes, setParticipacoes] = useState<UsuarioMissao[]>([])
  const [comunidades, setComunidades] = useState<Comunidade[]>([])
  const [minhasComunidades, setMinhasComunidades] = useState<UsuarioComunidade[]>([])
  const [postagens, setPostagens] = useState<Postagem[]>([])
  const [autores, setAutores] = useState<Record<number, string>>({})
  const [erroIndicadores, setErroIndicadores] = useState('')
  const [erroJornada, setErroJornada] = useState('')
  const [erroComunidades, setErroComunidades] = useState('')
  const [erroFeed, setErroFeed] = useState('')
  const [abaFeed, setAbaFeed] = useState<AbaFeed>('para-voce')
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [comunidadeSelecionada, setComunidadeSelecionada] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [erroPublicacao, setErroPublicacao] = useState('')
  const [publicacaoConcluida, setPublicacaoConcluida] = useState(false)
  const [avisoAcaoPostagem, setAvisoAcaoPostagem] = useState('')

  useEffect(() => {
    document.title = 'Soulie | Início'
  }, [])

  useEffect(() => {
    const controller = new AbortController()

    async function carregarInicio() {
      const [
        resultadoStreak,
        resultadoAvatar,
        resultadoJornada,
        resultadoComunidades,
        resultadoMinhasComunidades,
        resultadoFeed,
      ] = await Promise.all([
        executarConsulta(() => streakService.buscarPorUsuario(usuario.idUsuario, controller.signal)),
        executarConsulta(() => avatarService.buscarPorUsuario(usuario.idUsuario, controller.signal)),
        executarConsulta(() => missaoService.listarParticipacoesDoUsuario(usuario.idUsuario, controller.signal)),
        executarConsulta(() => comunidadeService.listar(controller.signal)),
        executarConsulta(() => comunidadeService.listarDoUsuario(usuario.idUsuario, controller.signal)),
        executarConsulta(() => postagemService.listar(controller.signal)),
      ])
      if (controller.signal.aborted) return

      const errosIndicadores: string[] = []

      if (resultadoStreak.status === 'fulfilled') setStreak(resultadoStreak.value)
      else if (ehNaoEncontrado(resultadoStreak.reason)) setStreak(null)
      else {
        setStreak(null)
        errosIndicadores.push(textoDeErro(resultadoStreak.reason, 'Não foi possível carregar sua sequência.'))
      }

      if (resultadoAvatar.status === 'fulfilled') setAvatar(resultadoAvatar.value)
      else if (ehNaoEncontrado(resultadoAvatar.reason)) setAvatar(null)
      else {
        setAvatar(null)
        errosIndicadores.push(textoDeErro(resultadoAvatar.reason, 'Não foi possível carregar seu nível.'))
      }
      setErroIndicadores(errosIndicadores.join(' '))

      if (resultadoJornada.status === 'fulfilled') setParticipacoes(resultadoJornada.value)
      else {
        setParticipacoes([])
        setErroJornada(textoDeErro(resultadoJornada.reason, 'Não foi possível carregar seu progresso.'))
      }

      if (resultadoComunidades.status === 'fulfilled') setComunidades(resultadoComunidades.value)
      else {
        setComunidades([])
        setErroComunidades(textoDeErro(resultadoComunidades.reason, 'Não foi possível carregar as comunidades.'))
      }

      if (resultadoMinhasComunidades.status === 'fulfilled') setMinhasComunidades(resultadoMinhasComunidades.value)
      else {
        setMinhasComunidades([])
        setErroComunidades(textoDeErro(resultadoMinhasComunidades.reason, 'Não foi possível carregar suas comunidades.'))
      }

      if (resultadoFeed.status === 'fulfilled') {
        const recentes = resultadoFeed.value
          .slice()
          .sort((a, b) => new Date(b.dataPostagem).getTime() - new Date(a.dataPostagem).getTime())
          .slice(0, 12)
        setPostagens(recentes)

        const idsAutores = [...new Set(recentes.map((postagem) => postagem.idUsuario))]
          .filter((idUsuario) => idUsuario !== usuario.idUsuario)
        const autoresCarregados: Record<number, string> = { [usuario.idUsuario]: usuario.nomeUsuario }
        setAutores(autoresCarregados)
        setErroFeed('')
        setCarregando(false)

        const autoresAtualizados = { ...autoresCarregados }
        for (const idUsuario of idsAutores) {
          const resultado = await executarConsulta(() =>
            usuarioService.buscarPorId(idUsuario, controller.signal),
          )
          if (controller.signal.aborted) return
          if (resultado.status === 'fulfilled') {
            autoresAtualizados[idUsuario] = resultado.value.nomeUsuario
            setAutores({ ...autoresAtualizados })
          }
        }
      } else {
        setPostagens([])
        setErroFeed(textoDeErro(resultadoFeed.reason, 'Não foi possível carregar as publicações.'))
        setCarregando(false)
      }
    }

    void carregarInicio()
    return () => controller.abort()
  }, [tentativa, usuario.idUsuario, usuario.nomeUsuario])

  const nomesComunidades = useMemo(
    () => new Map(comunidades.map((comunidade) => [comunidade.idComunidade, comunidade.nome])),
    [comunidades],
  )
  const idsMinhasComunidades = useMemo(
    () => new Set(minhasComunidades.map((participacao) => participacao.idComunidade)),
    [minhasComunidades],
  )
  const postagensVisiveis = useMemo(() => {
    if (abaFeed === 'para-voce') return postagens
    return postagens.filter((postagem) => idsMinhasComunidades.has(postagem.idComunidade))
  }, [abaFeed, idsMinhasComunidades, postagens])
  const participacoesAtivas = participacoes.filter((participacao) => participacao.status === 'EM_ANDAMENTO')
  const participacoesConcluidas = participacoes.filter((participacao) => participacao.status === 'CONCLUIDA')
  const percentualConcluido = participacoes.length
    ? Math.round((participacoesConcluidas.length / participacoes.length) * 100)
    : 0

  const acaoSoulie = useMemo(() => {
    if (!minhasComunidades.length) {
      return {
        imagem: avatarDuvida,
        mensagem: 'Você ainda não entrou em uma comunidade. Encontre um grupo para trocar ideias e acompanhar outras jornadas.',
        rotuloAcao: 'Explorar comunidades',
        executar: () => navigate('/app/comunidades'),
      }
    }
    if (participacoesAtivas.length) {
      return {
        imagem: avatarSorridente,
        mensagem: `Você tem ${participacoesAtivas.length} ${participacoesAtivas.length === 1 ? 'missão em andamento' : 'missões em andamento'}. Continue sua jornada no seu ritmo.`,
        rotuloAcao: 'Ver minhas missões',
        executar: () => navigate('/app/missoes'),
      }
    }
    if (!postagens.length) {
      return {
        imagem: avatarDuvida,
        mensagem: 'Sua primeira publicação pode inspirar outras pessoas. Conte para a comunidade uma pequena ação sustentável que você já colocou em prática.',
        rotuloAcao: 'Compartilhar uma conquista',
        executar: irParaPublicacao,
      }
    }
    return {
      imagem: avatarRadiante,
      mensagem: 'Que tal dar o próximo passo? Uma missão pode transformar uma pequena ação em um novo hábito.',
      rotuloAcao: 'Encontrar uma missão',
      executar: () => navigate('/app/missoes'),
    }
  }, [minhasComunidades.length, navigate, participacoesAtivas.length, postagens.length])

  function tentarNovamente() {
    setCarregando(true)
    setErroIndicadores('')
    setErroJornada('')
    setErroComunidades('')
    setErroFeed('')
    setTentativa((valor) => valor + 1)
  }

  async function publicar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    if (!comunidadeSelecionada) return

    setPublicando(true)
    setErroPublicacao('')
    setPublicacaoConcluida(false)
    try {
      const novaPostagem = await postagemService.criar({
        idUsuario: usuario.idUsuario,
        idComunidade: Number(comunidadeSelecionada),
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        dataPostagem: dataHoraLocal(),
      })
      setPostagens((atuais) => [novaPostagem, ...atuais].slice(0, 12))
      setAutores((atuais) => ({ ...atuais, [usuario.idUsuario]: usuario.nomeUsuario }))
      setTitulo('')
      setConteudo('')
      setAbaFeed('comunidades')
      setPublicacaoConcluida(true)
    } catch (erro) {
      setErroPublicacao(textoDeErro(erro, 'Não foi possível publicar agora. Tente novamente.'))
    } finally {
      setPublicando(false)
    }
  }

  async function atualizarPublicacao(postagem: Postagem, dados: Pick<Postagem, 'titulo' | 'conteudo'>) {
    const postagemAtualizada = await postagemService.atualizar(postagem.idPostagem, {
      idUsuario: usuario.idUsuario,
      idComunidade: postagem.idComunidade,
      titulo: dados.titulo,
      conteudo: dados.conteudo,
      dataPostagem: postagem.dataPostagem,
    })
    setPostagens((atuais) => atuais.map((item) =>
      item.idPostagem === postagemAtualizada.idPostagem ? postagemAtualizada : item,
    ))
    setAvisoAcaoPostagem('Sua publicação foi atualizada.')
  }

  async function excluirPublicacao(postagem: Postagem) {
    await postagemService.excluir(postagem.idPostagem)
    setPostagens((atuais) => atuais.filter((item) => item.idPostagem !== postagem.idPostagem))
    setAvisoAcaoPostagem('Sua publicação foi excluída.')
  }

  function irParaPublicacao() {
    document.getElementById('nova-publicacao')?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    document.getElementById('titulo-publicacao')?.focus({ preventScroll: true })
  }

  if (carregando) {
    return <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12"><LoadingState mensagem="Carregando sua jornada e as publicações..." /></main>
  }

  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-10">
      <header className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
        <div className="pr-20 lg:pr-0">
          <h1 className="text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Olá, {nomeCurto(usuario.nomeUsuario)}<span aria-hidden="true">!</span></h1>
          <p className="mt-2 max-w-2xl text-base leading-7 text-zinc-600">Acompanhe sua jornada e veja o que a comunidade está fazendo.</p>
        </div>
        <section aria-label="Indicadores da jornada" className="grid grid-cols-3 gap-2 sm:flex sm:gap-4">
          <Indicador icone={<Flame aria-hidden="true" className="h-4 w-4 text-orange-500" />} rotulo="Streak" valor={streak ? `${streak.diasConsecutivos} dia${streak.diasConsecutivos === 1 ? '' : 's'}` : '—'} />
          <Indicador icone={<Star aria-hidden="true" className="h-4 w-4 text-violet-600" />} rotulo="Pontos" valor={usuario.pontosAcumulados.toLocaleString('pt-BR')} />
          <Indicador icone={<TrendingUp aria-hidden="true" className="h-4 w-4 text-violet-600" />} rotulo="Nível" valor={avatar ? `Nível ${avatar.nivelEvolucao}` : '—'} />
        </section>
      </header>

      {(erroIndicadores || erroJornada || erroComunidades) && (
        <div className="mt-5 flex flex-col gap-2 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 sm:flex-row sm:items-center sm:justify-between">
          <p>Algumas informações da sua jornada não carregaram. {erroIndicadores || erroJornada || erroComunidades}</p>
          <button type="button" onClick={tentarNovamente} className="w-fit font-bold text-violet-800 underline underline-offset-4">Tentar novamente</button>
        </div>
      )}

      <section aria-labelledby="titulo-jornada" className="mt-8 rounded-3xl border border-violet-200 bg-gradient-to-br from-violet-50 to-white p-6 shadow-[0_14px_40px_-32px_rgba(46,16,101,0.4)] sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-violet-700">Sua jornada</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <h2 id="titulo-jornada" className="text-2xl font-black tracking-tight text-zinc-950">Hábitos sustentáveis</h2>
              <span className="rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-800">{participacoesAtivas.length ? 'Em andamento' : 'No seu ritmo'}</span>
            </div>
            <p className="mt-2 text-sm leading-6 text-zinc-600">Acompanhe as missões que você começou e celebre cada etapa concluída.</p>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <p className="shrink-0 text-sm font-semibold text-zinc-700">{participacoesConcluidas.length} de {participacoes.length} concluídas</p>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-violet-100" role="progressbar" aria-label="Progresso geral das missões" aria-valuenow={percentualConcluido} aria-valuemin={0} aria-valuemax={100}>
                <div className="h-full rounded-full bg-violet-600 transition-[width] duration-500" style={{ width: `${percentualConcluido}%` }} />
              </div>
            </div>
          </div>
          <Link to="/app/missoes" className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-3.5 text-sm font-bold text-white transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700">
            Continuar missão <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section aria-label="Publicações da comunidade" className="mt-9">
        <div role="tablist" aria-label="Filtro de publicações" className="flex gap-7 border-b border-zinc-200">
          <button type="button" role="tab" aria-controls="feed-publicacoes" aria-selected={abaFeed === 'para-voce'} onClick={() => setAbaFeed('para-voce')} className={`relative -mb-px px-1 pb-3 text-sm font-bold transition ${abaFeed === 'para-voce' ? 'border-b-2 border-violet-600 text-violet-700' : 'text-zinc-500 hover:text-zinc-800'}`}>
            Para você
          </button>
          <button type="button" role="tab" aria-controls="feed-publicacoes" aria-selected={abaFeed === 'comunidades'} onClick={() => setAbaFeed('comunidades')} className={`relative -mb-px px-1 pb-3 text-sm font-bold transition ${abaFeed === 'comunidades' ? 'border-b-2 border-violet-600 text-violet-700' : 'text-zinc-500 hover:text-zinc-800'}`}>
            Comunidades
          </button>
        </div>

        <form id="nova-publicacao" onSubmit={publicar} className="mt-5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <span aria-hidden="true" className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700 sm:flex">
              {usuario.nomeUsuario.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()}
            </span>
            <div className="grid min-w-0 flex-1 gap-3 md:grid-cols-[minmax(0,1fr)_220px]">
              <input id="titulo-publicacao" aria-label="Título da publicação" value={titulo} onChange={(event) => setTitulo(event.target.value)} required maxLength={120} placeholder="Compartilhe uma conquista da sua jornada..." className="h-12 min-w-0 rounded-xl border border-zinc-200 px-4 text-sm outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
              <select aria-label="Comunidade da publicação" value={comunidadeSelecionada} onChange={(event) => setComunidadeSelecionada(event.target.value)} required disabled={!minhasComunidades.length} className="h-12 rounded-xl border border-zinc-200 bg-white px-3 text-sm text-zinc-700 outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100 disabled:bg-zinc-50 disabled:text-zinc-400">
                <option value="">{minhasComunidades.length ? 'Escolha uma comunidade' : 'Entre em uma comunidade para publicar'}</option>
                {minhasComunidades.map((participacao) => {
                  const comunidade = comunidades.find((item) => item.idComunidade === participacao.idComunidade)
                  return <option key={participacao.idComunidade} value={participacao.idComunidade}>{comunidade?.nome ?? `Comunidade ${participacao.idComunidade}`}</option>
                })}
              </select>
            </div>
            <button type="submit" disabled={publicando || !minhasComunidades.length} className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 text-sm font-bold text-white transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-not-allowed disabled:opacity-50">
              {publicando ? 'Publicando...' : 'Publicar'} <Send aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
          <textarea aria-label="Conteúdo da publicação" value={conteudo} onChange={(event) => setConteudo(event.target.value)} required maxLength={1000} rows={2} placeholder="Conte um pouco mais sobre essa ação..." className="mt-3 min-h-20 w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
          {erroPublicacao && <p role="alert" className="mt-3 text-sm font-medium text-rose-700">{erroPublicacao}</p>}
          {publicacaoConcluida && <p role="status" className="mt-3 text-sm font-medium text-emerald-700">Publicação compartilhada com a comunidade.</p>}
          {!minhasComunidades.length && !erroComunidades && <p className="mt-3 text-sm text-zinc-600">Para publicar, primeiro participe de uma comunidade. <Link to="/app/comunidades" className="font-bold text-violet-700 underline underline-offset-2">Encontrar comunidades</Link></p>}
        </form>

        {avisoAcaoPostagem && <p role="status" className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-800">{avisoAcaoPostagem}</p>}

        <div id="feed-publicacoes" role="tabpanel" aria-label={abaFeed === 'para-voce' ? 'Publicações para você' : 'Publicações das suas comunidades'} tabIndex={0}>
        {erroFeed ? (
          <div className="mt-4"><ErrorState mensagem={erroFeed} tentarNovamente={tentarNovamente} /></div>
        ) : postagensVisiveis.length === 0 ? (
          <div className="mt-4">
            <EmptyState
              titulo={abaFeed === 'para-voce' ? 'Ainda não há publicações' : 'Ainda não há publicações nas suas comunidades'}
              mensagem={abaFeed === 'para-voce' ? 'Quando alguém compartilhar uma conquista, ela aparecerá aqui.' : 'As publicações dos grupos em que você participa aparecerão aqui.'}
            />
          </div>
        ) : (
          <div className="mt-4 space-y-3" role="tabpanel">
            {postagensVisiveis.map((postagem) => (
              <article key={postagem.idPostagem} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:px-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700">
                      {(autores[postagem.idUsuario] ?? 'S').split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()}
                    </span>
                    <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-2">
                      <h3 className="font-bold text-zinc-950">{autores[postagem.idUsuario] ?? 'Pessoa da comunidade'}</h3>
                      <span className="hidden text-zinc-400 sm:inline">em</span>
                      <Link to="/app/comunidades" className="text-sm font-medium text-violet-700 hover:text-violet-900">{nomesComunidades.get(postagem.idComunidade) ?? `Comunidade ${postagem.idComunidade}`}</Link>
                    </div>
                    <time dateTime={postagem.dataPostagem} className="mt-1 block text-xs text-zinc-500">{formatarData(postagem.dataPostagem)}</time>
                    <h4 className="mt-3 font-semibold text-zinc-900">{postagem.titulo}</h4>
                    <p className="mt-1 whitespace-pre-line text-sm leading-6 text-zinc-700">{postagem.conteudo}</p>
                    </div>
                  </div>
                  {postagem.idUsuario === usuario.idUsuario ? (
                    <AcoesPublicacao postagem={postagem} aoAtualizar={atualizarPublicacao} aoExcluir={excluirPublicacao} />
                  ) : (
                    <MessageCircle aria-hidden="true" className="hidden h-5 w-5 shrink-0 text-violet-400 sm:block" />
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
        </div>
      </section>

      <AcaoGuiadaSoulie
        imagem={acaoSoulie.imagem}
        mensagem={acaoSoulie.mensagem}
        rotuloAcao={acaoSoulie.rotuloAcao}
        onAcao={acaoSoulie.executar}
      />
    </main>
  )
}

interface IndicadorProps {
  icone: React.ReactNode
  rotulo: string
  valor: string
}

function Indicador({ icone, rotulo, valor }: IndicadorProps) {
  return (
    <div className="flex min-w-0 items-center gap-2 rounded-2xl border border-zinc-200 bg-white px-3 py-2.5 sm:gap-3 sm:px-4">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-violet-50">{icone}</span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium text-zinc-500 sm:text-xs">{rotulo}</p>
        <p className="truncate text-xs font-bold text-zinc-900 sm:text-sm">{valor}</p>
      </div>
    </div>
  )
}
