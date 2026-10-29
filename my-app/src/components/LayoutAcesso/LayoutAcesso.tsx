import type { ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import souliePaz from '../../assets/avatar/integrantes/soulie-paz.png'
import souliePositivo from '../../assets/avatar/integrantes/soulie-positivo.png'

interface LayoutAcessoProps {
  titulo: string
  descricao: string
  carregando: boolean
  children: ReactNode
  rodape: ReactNode
}

export default function LayoutAcesso({ titulo, descricao, carregando, children, rodape }: LayoutAcessoProps) {
  return (
    <main className="relative flex min-h-dvh items-center overflow-hidden bg-white px-4 pb-5 pt-20 text-zinc-900 sm:px-8 sm:pb-8 sm:pt-28">
      <header className="absolute inset-x-0 top-0 mx-auto flex w-full max-w-340 items-center justify-start px-4 py-5 sm:px-8 sm:py-7">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-zinc-600 transition hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4 text-violet-700" />
          Voltar ao site
        </Link>
      </header>

      <div className="relative mx-auto w-full max-w-177.5">
        <section className="relative z-10 w-full max-w-177.5 rounded-3xl border border-violet-200 bg-white px-5 py-6 shadow-[0_20px_55px_-42px_rgba(76,29,149,0.4)] sm:px-12 sm:py-10 lg:px-17 lg:py-9">
          <div className="text-center">
            <Link to="/" className="text-4xl font-black leading-none tracking-tight text-violet-700 sm:text-[2.75rem]">Soulie</Link>
            <p className="mt-5 text-xs font-bold uppercase tracking-[0.2em] text-violet-700 sm:mt-7">Sua jornada</p>
            <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-950 sm:text-[2.65rem]">{titulo}</h1>
            <p className="mt-2 text-sm leading-5 text-zinc-600 sm:mt-3 sm:text-base sm:leading-6">{descricao}</p>
          </div>

          {children}

          <div className="mt-4 text-center text-xs leading-5 text-zinc-600 sm:mt-6 sm:text-sm sm:leading-6">
            {rodape}
          </div>
        </section>

        <aside
          className="pointer-events-none absolute left-0 top-1/2 z-20 hidden translate-x-[-85%] -translate-y-1/2 xl:block"
          aria-label="Soulie acompanha seu acesso"
        >
          <img
            src={carregando ? souliePositivo : souliePaz}
            alt={carregando ? 'Soulie comemorando o acesso' : 'Soulie fazendo sinal de paz ao lado do formulário'}
            className="w-36 object-contain drop-shadow-[0_14px_20px_rgba(109,40,217,0.17)] sm:w-40"
          />
        </aside>
      </div>
    </main>
  )
}
