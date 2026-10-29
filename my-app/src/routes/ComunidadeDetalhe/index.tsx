import { useEffect, useMemo, useState } from 'react'
import { ArrowLeft, ArrowRight, CalendarDays, Users } from 'lucide-react'
import { Link, useNavigate, useOutletContext, useParams } from 'react-router-dom'
import avatarRadiante from '../../assets/avatar/expressoes/avatar_radiante.png'
import avatarSorridente from '../../assets/avatar/expressoes/avatar_sorridente.png'
import AcaoGuiadaSoulie, { type PassoGuiaSoulie } from '../../components/AcaoGuiadaSoulie/AcaoGuiadaSoulie'
import { tutorialParticipar, tutorialPublicar } from '../../components/TutorialSoulie/tutoriaisSoulie'
import useTutorialSolicitado from '../../components/TutorialSoulie/useTutorialSolicitado'
import type { TutorialSoulie } from '../../components/TutorialSoulie/TutorialSoulieContext'
import FormPublicacaoComunidade from '../../components/FormPublicacaoComunidade/FormPublicacaoComunidade'
import EmptyState from '../../components/EmptyState/EmptyState'
import ErrorState from '../../components/ErrorState/ErrorState'
import LoadingState from '../../components/LoadingState/LoadingState'
import { ApiError } from '../../services/apiClient'
import { comunidadeService } from '../../services/comunidadeService'
import { postagemService } from '../../services/postagemService'
import { usuarioService } from '../../services/usuarioService'
import type { Comunidade, Postagem, Usuario, UsuarioComunidade } from '../../types/api'

type Estado<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }

const capas = {
  mobilidade: 'https://images.unsplash.com/photo-1778513598331-e2c294dcbdd6?auto=format&fit=crop&w=1200&q=80',
  reciclagem: 'https://images.unsplash.com/photo-1771172195332-3bc9ded9f3b5?auto=format&fit=crop&w=1200&q=80',
  agua: 'https://images.unsplash.com/photo-1773876112010-503345553a7d?auto=format&fit=crop&w=1200&q=80',
  energia: 'https://images.unsplash.com/photo-1761661182058-b718b6676caf?auto=format&fit=crop&w=1200&q=80',
  natureza: 'https://images.unsplash.com/photo-1781785161788-a906202dba8f?auto=format&fit=crop&w=1200&q=80',
}

function capaDaComunidade(comunidade: Comunidade) {
  const tema = `${comunidade.nome} ${comunidade.tema}`.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()
  if (/mobilidade|bicicleta|bike|transporte|caminhada/.test(tema)) return capas.mobilidade
  if (/reciclagem|recicl|residuo|lixo|descarte|coleta/.test(tema)) return capas.reciclagem
  if (/agua|oceano|mar|praia|rios/.test(tema)) return capas.agua
  if (/energia|solar|eolica|renovavel|ods 7/.test(tema)) return capas.energia
  return capas.natureza
}

function dataLocal() {
  const agora = new Date()
  const deslocamento = agora.getTimezoneOffset() * 60_000
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 10)
}

function formatarData(data: string) {
  const valor = new Date(data + 'T00:00:00')
  if (Number.isNaN(valor.getTime())) return data
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium' }).format(valor)
}

function formatarDataHora(data: string) {
  const valor = new Date(data)
  if (Number.isNaN(valor.getTime())) return data
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'medium', timeStyle: 'short' }).format(valor)
}

function mensagemErro(erro: unknown, padrao: string) {
  return erro instanceof Error ? erro.message : padrao
}

export default function ComunidadeDetalhe() {
  const { id } = useParams()
  return <DetalheComunidade key={id} id={id} />
}

function DetalheComunidade({ id }: { id?: string }) {
  const navigate = useNavigate()
  const usuario = useOutletContext<Usuario>()
  const idComunidade = Number(id)
  const idValido = Number.isSafeInteger(idComunidade) && idComunidade > 0
  const [comunidade, setComunidade] = useState<Estado<Comunidade>>({ status: 'loading' })
  const [participacao, setParticipacao] = useState<Estado<UsuarioComunidade | null>>({ status: 'loading' })
  const [quantidadeMembros, setQuantidadeMembros] = useState<Estado<number>>({ status: 'loading' })
  const [idParticipacaoCarregada, setIdParticipacaoCarregada] = useState<number | null>(null)
  const [publicacoes, setPublicacoes] = useState<Estado<Postagem[]>>({ status: 'loading' })
  const [autores, setAutores] = useState<Record<number, string>>({})
  const [erroAcao, setErroAcao] = useState('')
  const [processando, setProcessando] = useState(false)
  const [tentativa, setTentativa] = useState(0)

  useEffect(() => {
    document.title = 'Soulie | Comunidade'
  }, [])

  useEffect(() => {
    if (!idValido) return
    const controller = new AbortController()

    async function carregarComunidade() {
      try {
        const data = await comunidadeService.buscarPorId(idComunidade, controller.signal)
        if (!controller.signal.aborted) setComunidade({ status: 'success', data })
      } catch (erroBusca) {
        if (controller.signal.aborted) return
        try {
          const comunidades = await comunidadeService.listar(controller.signal)
          if (controller.signal.aborted) return
          const data = comunidades.find((item) => item.idComunidade === idComunidade)
          if (!data) throw erroBusca
          setComunidade({ status: 'success', data })
        } catch (erroLista) {
          if (!controller.signal.aborted) setComunidade({ status: 'error', message: mensagemErro(erroLista, 'Não foi possível carregar esta comunidade.') })
        }
      }
    }

    void carregarComunidade()
    return () => controller.abort()
  }, [idComunidade, idValido, tentativa])

  useEffect(() => {
    if (!idValido) return
    const controller = new AbortController()

    async function carregarParticipacao() {
      try {
        const participacoes = await comunidadeService.listarDoUsuario(usuario.idUsuario, controller.signal)
        if (controller.signal.aborted) return
        const minhaParticipacao = participacoes.find((item) => item.idComunidade === idComunidade) ?? null
        setParticipacao({ status: 'success', data: minhaParticipacao })
        setIdParticipacaoCarregada(idComunidade)
      } catch {
        if (controller.signal.aborted) return
        try {
          const minhaParticipacao = await comunidadeService.buscarParticipacao(usuario.idUsuario, idComunidade, controller.signal)
          if (controller.signal.aborted) return
          setParticipacao({ status: 'success', data: minhaParticipacao ?? null })
          setIdParticipacaoCarregada(idComunidade)
        } catch (erro) {
          if (controller.signal.aborted) return
          if (erro instanceof ApiError && erro.status === 404) {
            setParticipacao({ status: 'success', data: null })
            setIdParticipacaoCarregada(idComunidade)
            return
          }
          setParticipacao({ status: 'error', message: mensagemErro(erro, 'Não foi possível verificar sua participação.') })
          setIdParticipacaoCarregada(idComunidade)
        }
      }
    }

    void carregarParticipacao()
    return () => controller.abort()
  }, [idComunidade, idValido, tentativa, usuario.idUsuario])

  useEffect(() => {
    if (!idValido) return
    const controller = new AbortController()

    async function carregarQuantidadeMembros() {
      try {
        const participantes = await comunidadeService.listarParticipantes(idComunidade, controller.signal)
        if (!controller.signal.aborted) setQuantidadeMembros({ status: 'success', data: participantes.length })
      } catch (erro) {
        if (controller.signal.aborted) return
        if (erro instanceof ApiError && erro.status === 404) {
          setQuantidadeMembros({ status: 'success', data: 0 })
          return
        }
        setQuantidadeMembros({ status: 'error', message: mensagemErro(erro, 'Não foi possível carregar a quantidade de membros.') })
      }
    }

    void carregarQuantidadeMembros()
    return () => controller.abort()
  }, [idComunidade, idValido, tentativa])

  useEffect(() => {
    if (!idValido) return
    const controller = new AbortController()
    async function carregarPublicacoes() {
      try {
        let lista: Postagem[]
        try {
          lista = await postagemService.listarDaComunidade(idComunidade, controller.signal)
        } catch {
          if (controller.signal.aborted) return
          const todasAsPublicacoes = await postagemService.listar(controller.signal)
          lista = todasAsPublicacoes.filter((item) => item.idComunidade === idComunidade)
        }
        if (controller.signal.aborted) return
        const recentes = [...lista].sort((a, b) => Date.parse(b.dataPostagem) - Date.parse(a.dataPostagem))
        setPublicacoes((atuais) => {
          const publicacoesLocais = atuais.status === 'success'
            ? atuais.data.filter((atual) => !recentes.some((recente) => recente.idPostagem === atual.idPostagem))
            : []
          return {
            status: 'success',
            data: [...publicacoesLocais, ...recentes].sort((a, b) => Date.parse(b.dataPostagem) - Date.parse(a.dataPostagem)),
          }
        })
        const idsAutores = [...new Set(recentes.map((item) => item.idUsuario))]
        const respostas = await Promise.allSettled(idsAutores.map((idUsuario) => usuarioService.buscarPorId(idUsuario, controller.signal)))
        if (controller.signal.aborted) return
        const nomes = respostas.reduce<Record<number, string>>((resultado, resposta, indice) => {
          if (resposta.status === 'fulfilled') resultado[idsAutores[indice]] = resposta.value.nomeUsuario
          return resultado
        }, {})
        setAutores(nomes)
      } catch (erro) {
        if (!controller.signal.aborted) setPublicacoes({ status: 'error', message: mensagemErro(erro, 'Não foi possível carregar as publicações desta comunidade.') })
      }
    }
    void carregarPublicacoes()
    return () => controller.abort()
  }, [idComunidade, idValido, tentativa])

  const capa = useMemo(() => comunidade.status === 'success' ? capaDaComunidade(comunidade.data) : '', [comunidade])

  async function alternarParticipacao() {
    if (processando || comunidade.status !== 'success' || idParticipacaoCarregada !== idComunidade || participacao.status !== 'success') return
    setProcessando(true)
    setErroAcao('')
    try {
      if (participacao.data) {
        await comunidadeService.sair(usuario.idUsuario, idComunidade)
        setParticipacao({ status: 'success', data: null })
        setQuantidadeMembros((atual) => atual.status === 'success' ? { status: 'success', data: Math.max(0, atual.data - 1) } : atual)
      } else {
        const dadosParticipacao = {
          idUsuario: usuario.idUsuario,
          idComunidade,
          dataIngresso: dataLocal(),
        }
        const resposta = await comunidadeService.participar(dadosParticipacao)
        const novaParticipacao = resposta ?? dadosParticipacao
        setParticipacao({ status: 'success', data: novaParticipacao })
        setIdParticipacaoCarregada(idComunidade)
        setQuantidadeMembros((atual) => atual.status === 'success' ? { status: 'success', data: atual.data + 1 } : atual)
      }
    } catch (erro) {
      setErroAcao(mensagemErro(erro, 'Não foi possível atualizar sua participação. Tente novamente.'))
    } finally {
      setProcessando(false)
    }
  }

  const estadoParticipacaoAtual: Estado<UsuarioComunidade | null> = idParticipacaoCarregada === idComunidade
    ? participacao
    : { status: 'loading' }
  const jaParticipa = estadoParticipacaoAtual.status === 'success' && Boolean(estadoParticipacaoAtual.data)
  const tutorialPublicacao = tutorialPublicar({ titulo: 'titulo-publicacao-comunidade', conteudo: 'conteudo-publicacao-comunidade', enviar: 'enviar-publicacao-comunidade' })
  const tutorialEntrada = tutorialParticipar()
  const tutorialLeitura: TutorialSoulie = { id: 'ler-publicacoes', titulo: 'Ler as conversas', etapas: [
    { alvo: 'titulo-feed-comunidade', titulo: 'As novidades ficam aqui', descricao: 'As publicações aparecem da mais recente para a mais antiga. Cada uma mostra quem escreveu e quando foi enviada.' },
  ] }
  useTutorialSolicitado({ publicar: jaParticipa ? tutorialPublicacao : tutorialEntrada, 'participar-comunidade': jaParticipa ? tutorialPublicacao : tutorialEntrada }, comunidade.status === 'success' && estadoParticipacaoAtual.status === 'success')
  const passosSoulie: PassoGuiaSoulie[] = [
    {
      id: 'participar', titulo: jaParticipa ? 'Escrever publicação' : 'Participar do grupo',
      descricao: jaParticipa ? 'Aprenda a compartilhar sua ideia.' : 'Veja como entrar e começar a publicar.',
      acao: 'Iniciar tutorial', icone: jaParticipa ? 'publicacao' : 'comunidade',
      tutorial: jaParticipa ? tutorialPublicacao : tutorialEntrada,
      destaque: true,
    },
    {
      id: 'ler', titulo: 'Ver publicações',
      descricao: 'Entenda onde acompanhar as conversas.',
      acao: 'Iniciar tutorial', icone: 'explorar', tutorial: tutorialLeitura,
    },
    {
      id: 'explorar', titulo: 'Explorar outros grupos', descricao: 'Volte à lista e encontre novos temas.',
      acao: 'Aprender a buscar', icone: 'comunidade', executar: () => navigate('/app/comunidades', { state: { tutorialSoulie: 'buscar-comunidade' } }),
    },
  ]

  function tentarNovamente() {
    setIdParticipacaoCarregada(null)
    setTentativa((valor) => valor + 1)
  }

  if (!idValido) {
    return (
      <main className="mx-auto max-w-4xl px-5 py-10">
        <Link to="/app/comunidades" className="inline-flex items-center gap-2 text-sm font-semibold text-violet-700 hover:text-violet-900"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Voltar às comunidades</Link>
        <p role="alert" className="mt-6 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">O endereço desta comunidade não é válido.</p>
      </main>
    )
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8 sm:px-8 sm:py-10">
      <Link to="/app/comunidades" className="inline-flex items-center gap-2 rounded-lg text-sm font-semibold text-violet-700 hover:text-violet-900 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-violet-600">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" /> Voltar às comunidades
      </Link>

      {comunidade.status === 'loading' && <div className="mt-6"><LoadingState mensagem="Abrindo comunidade..." /></div>}
      {comunidade.status === 'error' && <div className="mt-6"><ErrorState mensagem={comunidade.message} tentarNovamente={tentarNovamente} /></div>}

      {comunidade.status === 'success' && (
        <>
          <header className="mt-6 overflow-hidden rounded-3xl border border-violet-100 bg-white shadow-sm">
            <div className="relative h-52 bg-gradient-to-br from-violet-200 via-violet-100 to-fuchsia-100 sm:h-64">
              <img src={capa} alt="" referrerPolicy="no-referrer" onError={(event) => { event.currentTarget.style.visibility = 'hidden' }} className="h-full w-full object-cover" />
              <span className="absolute bottom-4 left-4 rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-violet-800 shadow-sm">{comunidade.data.tema}</span>
            </div>
            <div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7">
              <div id="sobre-comunidade">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Comunidade Soulie</p>
                <h1 className="mt-2 text-2xl font-black tracking-tight text-zinc-950 sm:text-3xl">{comunidade.data.nome}</h1>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-600">Um espaço para trocar ideias, compartilhar experiências e descobrir novas ações sobre {comunidade.data.tema.toLowerCase()}.</p>
                {estadoParticipacaoAtual.status === 'success' && estadoParticipacaoAtual.data && (
                  <p className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-500"><CalendarDays aria-hidden="true" className="h-4 w-4" /> Participa desde {formatarData(estadoParticipacaoAtual.data.dataIngresso)}</p>
                )}
                <p className="mt-3 inline-flex items-center gap-2 text-sm text-zinc-500">
                  <Users aria-hidden="true" className="h-4 w-4" />
                  {quantidadeMembros.status === 'success'
                    ? `${quantidadeMembros.data} ${quantidadeMembros.data === 1 ? 'membro' : 'membros'}`
                    : quantidadeMembros.status === 'loading' ? 'Carregando membros...' : 'Quantidade de membros indisponível'}
                </p>
              </div>
              {estadoParticipacaoAtual.status === 'success' ? (
                <button id="participar-comunidade" type="button" onClick={() => void alternarParticipacao()} disabled={processando} className={estadoParticipacaoAtual.data
                  ? 'min-h-11 shrink-0 rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50'
                  : 'inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-700 disabled:opacity-50'}>
                  {processando ? 'Aguarde...' : estadoParticipacaoAtual.data ? 'Sair da comunidade' : 'Participar da comunidade'}
                  {!estadoParticipacaoAtual.data && <ArrowRight aria-hidden="true" className="h-4 w-4" />}
                </button>
              ) : (
                <span className="text-sm text-zinc-500">Verificando participação...</span>
              )}
            </div>
          </header>

          {erroAcao && <p role="alert" className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{erroAcao}</p>}
          {estadoParticipacaoAtual.status === 'error' && <p role="alert" className="mt-5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">{estadoParticipacaoAtual.message}</p>}

          {jaParticipa && (
            <FormPublicacaoComunidade
              idUsuario={usuario.idUsuario}
              idComunidade={idComunidade}
              nomeUsuario={usuario.nomeUsuario}
              nomeComunidade={comunidade.data.nome}
              aoPublicar={(novaPostagem) => {
                setPublicacoes((atuais) => ({
                  status: 'success',
                  data: [novaPostagem, ...(atuais.status === 'success' ? atuais.data : [])],
                }))
                setAutores((atuais) => ({ ...atuais, [usuario.idUsuario]: usuario.nomeUsuario }))
              }}
            />
          )}

          <section id="feed-comunidade" aria-labelledby="titulo-feed-comunidade" className="mt-8 scroll-mt-6">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Espaço da comunidade</p>
                <h2 id="titulo-feed-comunidade" className="mt-1 text-xl font-bold text-zinc-950">Publicações</h2>
              </div>
              {publicacoes.status === 'success' && <span className="text-sm text-zinc-500">{publicacoes.data.length} {publicacoes.data.length === 1 ? 'publicação' : 'publicações'}</span>}
            </div>
            {publicacoes.status === 'loading' && <LoadingState mensagem="Carregando publicações..." />}
            {publicacoes.status === 'error' && <ErrorState mensagem={publicacoes.message} tentarNovamente={tentarNovamente} />}
            {publicacoes.status === 'success' && publicacoes.data.length === 0 && (
              <EmptyState
                titulo="Ainda não há publicações"
                mensagem={jaParticipa ? 'Compartilhe a primeira ideia ou ação desta comunidade.' : 'Participe da comunidade para compartilhar ideias e acompanhar as conversas do grupo.'}
              />
            )}
            {publicacoes.status === 'success' && publicacoes.data.length > 0 && (
              <div className="space-y-3">
                {publicacoes.data.map((postagem) => {
                  const nomeAutor = autores[postagem.idUsuario] ?? 'Pessoa da comunidade'
                  const iniciais = nomeAutor.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()
                  return (
                    <article key={postagem.idPostagem} className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm sm:p-6">
                      <div className="flex items-start gap-3">
                        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700">{iniciais || 'SC'}</span>
                        <div className="min-w-0 flex-1">
                          <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
                            <p className="truncate font-bold text-zinc-950">{nomeAutor}</p>
                            <time dateTime={postagem.dataPostagem} className="shrink-0 text-xs text-zinc-500">{formatarDataHora(postagem.dataPostagem)}</time>
                          </div>
                          <h3 className="mt-3 font-semibold text-zinc-900">{postagem.titulo}</h3>
                          <p className="mt-1 whitespace-pre-line text-sm leading-6 text-zinc-700">{postagem.conteudo}</p>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            )}
          </section>
          {estadoParticipacaoAtual.status === 'success' && (
            <AcaoGuiadaSoulie
              imagem={jaParticipa ? avatarRadiante : avatarSorridente}
              titulo="Neste grupo"
              passos={passosSoulie}
            />
          )}
        </>
      )}
    </main>
  )
}
