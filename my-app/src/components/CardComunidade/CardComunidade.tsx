import { ArrowRight, Check } from 'lucide-react'
import type { Comunidade, UsuarioComunidade } from '../../types/api'

interface CardComunidadeProps {
  comunidade: Comunidade
  capa: string
  participacao?: UsuarioComunidade
  entrando: boolean
  saindo: boolean
  emDestaque?: boolean
  abrir: () => void
  entrar: () => void
  sair: () => void
}

export default function CardComunidade({
  comunidade,
  capa,
  participacao,
  entrando,
  saindo,
  emDestaque = false,
  abrir,
  entrar,
  sair,
}: CardComunidadeProps) {
  return (
    <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
      <button type="button" onClick={abrir} className="group relative block h-40 w-full overflow-hidden bg-gradient-to-br from-violet-200 via-violet-100 to-fuchsia-100 text-left focus-visible:outline-2 focus-visible:outline-offset-[-4px] focus-visible:outline-violet-600">
        <img
          src={capa}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={(event) => { event.currentTarget.style.visibility = 'hidden' }}
          className="absolute inset-0 h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
        <span className="absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-semibold text-violet-800 shadow-sm">{comunidade.tema}</span>
        {emDestaque && <span className="absolute right-3 top-3 rounded-full bg-violet-700 px-3 py-1 text-xs font-bold text-white">Sugestão Soulie</span>}
      </button>
      <div className="p-4">
        <button type="button" onClick={abrir} className="text-left text-lg font-bold text-zinc-950 hover:text-violet-800 focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">
          {comunidade.nome}
        </button>
        <p className="mt-1 text-sm text-zinc-600">Um espaço para trocar ideias sobre {comunidade.tema.toLowerCase()}.</p>
        {participacao && <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-800"><Check aria-hidden="true" className="h-4 w-4" /> Você participa</span>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          <button type="button" onClick={abrir} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-violet-200 bg-violet-50 px-3 py-2 text-xs font-bold text-violet-800 transition hover:bg-violet-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">
            Ver comunidade <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
          </button>
          {participacao ? (
            <button type="button" onClick={sair} disabled={saindo} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-600 transition hover:bg-zinc-50 hover:text-zinc-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:opacity-50">
              {saindo ? 'Saindo...' : 'Sair da comunidade'}
            </button>
          ) : (
            <button type="button" onClick={entrar} disabled={entrando} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-violet-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-60">
              {entrando ? 'Entrando...' : 'Participar'} <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>
    </article>
  )
}
