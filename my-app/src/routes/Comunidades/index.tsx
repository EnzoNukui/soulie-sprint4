import { UsersRound } from 'lucide-react'

export default function Comunidades() {
  return (
    <main className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
      <header>
        <p className="text-sm font-bold uppercase tracking-[0.16em] text-violet-700">Encontre seu grupo</p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-4xl">Comunidades</h1>
        <p className="mt-3 max-w-2xl text-base leading-7 text-zinc-600">
          Explore grupos, participe de conversas e encontre pessoas que compartilham seus interesses.
        </p>
      </header>

      <section className="mt-9 rounded-3xl border border-dashed border-violet-200 bg-white p-8 text-center sm:p-12">
        <span className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-50 text-violet-700">
          <UsersRound aria-hidden="true" className="h-7 w-7" />
        </span>
        <h2 className="mt-5 text-xl font-bold text-violet-950">A tela de comunidades será construída nesta etapa</h2>
        <p className="mx-auto mt-2 max-w-xl leading-6 text-zinc-600">
          A estrutura de navegação já está preparada. Em seguida entram as recomendações iniciais da Soulie, a busca e as ações para participar ou criar uma comunidade.
        </p>
      </section>
    </main>
  )
}
