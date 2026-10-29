import { useState, type FormEvent } from 'react'
import { Send } from 'lucide-react'
import { postagemService } from '../../services/postagemService'
import type { Postagem } from '../../types/api'

interface FormPublicacaoComunidadeProps {
  idUsuario: number
  idComunidade: number
  nomeUsuario: string
  nomeComunidade: string
  aoPublicar: (postagem: Postagem) => void
}

function dataHoraLocal() {
  const agora = new Date()
  const deslocamento = agora.getTimezoneOffset() * 60_000
  return new Date(agora.getTime() - deslocamento).toISOString().slice(0, 19)
}

export default function FormPublicacaoComunidade({
  idUsuario,
  idComunidade,
  nomeUsuario,
  nomeComunidade,
  aoPublicar,
}: FormPublicacaoComunidadeProps) {
  const [titulo, setTitulo] = useState('')
  const [conteudo, setConteudo] = useState('')
  const [publicando, setPublicando] = useState(false)
  const [erro, setErro] = useState('')
  const [publicada, setPublicada] = useState(false)

  async function publicar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setPublicando(true)
    setErro('')
    setPublicada(false)

    try {
      const novaPostagem = await postagemService.criar({
        idUsuario,
        idComunidade,
        titulo: titulo.trim(),
        conteudo: conteudo.trim(),
        dataPostagem: dataHoraLocal(),
      })
      aoPublicar(novaPostagem)
      setTitulo('')
      setConteudo('')
      setPublicada(true)
    } catch (erroPublicacao) {
      setErro(erroPublicacao instanceof Error ? erroPublicacao.message : 'Não foi possível publicar agora. Tente novamente.')
    } finally {
      setPublicando(false)
    }
  }

  const iniciais = nomeUsuario.split(/\s+/).slice(0, 2).map((parte) => parte[0]).join('').toUpperCase()

  return (
    <form id="nova-publicacao-comunidade" onSubmit={publicar} className="mt-7 scroll-mt-6 rounded-2xl border border-violet-100 bg-white p-4 shadow-sm sm:p-5">
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-black text-violet-700">
          {iniciais || 'SC'}
        </span>
        <div className="min-w-0 flex-1">
          <h2 className="font-bold text-zinc-950">Compartilhe com {nomeComunidade}</h2>
          <p className="mt-1 text-sm text-zinc-500">Conte uma ideia ou ação para as pessoas da comunidade.</p>
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <label className="sr-only" htmlFor="titulo-publicacao-comunidade">Título da publicação</label>
        <input
          id="titulo-publicacao-comunidade"
          value={titulo}
          onChange={(event) => setTitulo(event.target.value)}
          required
          maxLength={80}
          placeholder="Título da publicação"
          className="h-12 w-full rounded-xl border border-zinc-200 px-4 text-sm outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        />
        <label className="sr-only" htmlFor="conteudo-publicacao-comunidade">Conteúdo da publicação</label>
        <textarea
          id="conteudo-publicacao-comunidade"
          value={conteudo}
          onChange={(event) => setConteudo(event.target.value)}
          required
          maxLength={200}
          rows={3}
          placeholder="O que você gostaria de compartilhar?"
          className="min-h-24 w-full resize-y rounded-xl border border-zinc-200 px-4 py-3 text-sm leading-6 outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
        />
      </div>

      <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div aria-live="polite" className="text-sm">
          {erro && <p role="alert" className="font-medium text-rose-700">{erro}</p>}
          {publicada && <p role="status" className="font-medium text-emerald-700">Publicação compartilhada com a comunidade.</p>}
        </div>
        <button
          type="submit"
          disabled={publicando}
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-wait disabled:opacity-60"
        >
          {publicando ? 'Publicando...' : 'Publicar'}
          <Send aria-hidden="true" className="h-4 w-4" />
        </button>
      </div>
    </form>
  )
}
