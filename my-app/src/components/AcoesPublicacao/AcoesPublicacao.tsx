import { useState, type FormEvent } from 'react'
import { Pencil, Trash2, X } from 'lucide-react'
import type { Postagem } from '../../types/api'

interface ConteudoPublicacao {
  titulo: string
  conteudo: string
}

interface AcoesPublicacaoProps {
  postagem: Postagem
  aoAtualizar: (postagem: Postagem, conteudo: ConteudoPublicacao) => Promise<void>
  aoExcluir: (postagem: Postagem) => Promise<void>
}

function mensagemErro(erro: unknown) {
  return erro instanceof Error ? erro.message : 'Não foi possível concluir a ação. Tente novamente.'
}

export default function AcoesPublicacao({ postagem, aoAtualizar, aoExcluir }: AcoesPublicacaoProps) {
  const [abrirEdicao, setAbrirEdicao] = useState(false)
  const [titulo, setTitulo] = useState(postagem.titulo)
  const [conteudo, setConteudo] = useState(postagem.conteudo)
  const [processando, setProcessando] = useState<'salvando' | 'excluindo' | null>(null)
  const [erro, setErro] = useState('')

  function iniciarEdicao() {
    setTitulo(postagem.titulo)
    setConteudo(postagem.conteudo)
    setErro('')
    setAbrirEdicao(true)
  }

  async function salvarEdicao(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setProcessando('salvando')
    setErro('')
    try {
      await aoAtualizar(postagem, { titulo: titulo.trim(), conteudo: conteudo.trim() })
      setAbrirEdicao(false)
    } catch (erroAtualizacao) {
      setErro(mensagemErro(erroAtualizacao))
    } finally {
      setProcessando(null)
    }
  }

  async function excluir() {
    if (!window.confirm('Tem certeza de que deseja excluir esta publicação?')) return

    setProcessando('excluindo')
    setErro('')
    try {
      await aoExcluir(postagem)
    } catch (erroExclusao) {
      setErro(mensagemErro(erroExclusao))
    } finally {
      setProcessando(null)
    }
  }

  return (
    <div className="shrink-0">
      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
        <button
          type="button"
          onClick={iniciarEdicao}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-violet-700 transition hover:bg-violet-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 sm:text-sm"
        >
          <Pencil aria-hidden="true" className="h-4 w-4" /> Editar
        </button>
        <button
          type="button"
          onClick={() => void excluir()}
          disabled={processando !== null}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg px-2.5 text-xs font-semibold text-rose-700 transition hover:bg-rose-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose-600 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
        >
          <Trash2 aria-hidden="true" className="h-4 w-4" />
          {processando === 'excluindo' ? 'Excluindo...' : 'Excluir'}
        </button>
      </div>

      {erro && !abrirEdicao && <p role="alert" className="mt-2 text-sm font-medium text-rose-700">{erro}</p>}

      {abrirEdicao && (
        <div
          className="fixed inset-0 z-50 grid place-items-center bg-zinc-950/40 p-4"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && processando !== 'salvando') setAbrirEdicao(false)
          }}
        >
          <section role="dialog" aria-modal="true" aria-labelledby={`titulo-editar-${postagem.idPostagem}`} className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl border border-violet-100 bg-white p-6 shadow-2xl sm:p-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-violet-700">Sua publicação</p>
                <h2 id={`titulo-editar-${postagem.idPostagem}`} className="mt-2 text-2xl font-black text-zinc-950">Editar publicação</h2>
              </div>
              <button type="button" onClick={() => setAbrirEdicao(false)} disabled={processando === 'salvando'} aria-label="Fechar edição" className="rounded-lg p-2 text-zinc-500 transition hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50">
                <X aria-hidden="true" className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={(event) => void salvarEdicao(event)} className="mt-6 space-y-4">
              <label className="block text-sm font-semibold text-zinc-800">
                Título
                <input value={titulo} onChange={(event) => setTitulo(event.target.value)} required maxLength={80} className="mt-2 h-11 w-full rounded-xl border border-zinc-300 px-3 font-normal outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
              </label>
              <label className="block text-sm font-semibold text-zinc-800">
                Conteúdo
                <textarea value={conteudo} onChange={(event) => setConteudo(event.target.value)} required maxLength={200} rows={5} className="mt-2 w-full resize-y rounded-xl border border-zinc-300 px-3 py-2.5 font-normal outline-none transition focus:border-violet-500 focus:ring-4 focus:ring-violet-100" />
              </label>
              {erro && <p role="alert" className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900">{erro}</p>}
              <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row sm:justify-end">
                <button type="button" onClick={() => setAbrirEdicao(false)} disabled={processando === 'salvando'} className="min-h-11 rounded-xl border border-zinc-300 px-5 py-2.5 text-sm font-semibold text-zinc-700 transition hover:bg-zinc-50 disabled:opacity-50">Cancelar</button>
                <button type="submit" disabled={processando !== null} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-violet-700 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-violet-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-700 disabled:cursor-wait disabled:opacity-60">
                  {processando === 'salvando' ? 'Salvando...' : 'Salvar alterações'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </div>
  )
}
