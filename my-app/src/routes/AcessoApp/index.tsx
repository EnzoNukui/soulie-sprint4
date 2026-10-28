import { useEffect, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import souliePaz from '../../assets/avatar/integrantes/soulie-paz.png'
import souliePositivo from '../../assets/avatar/integrantes/soulie-positivo.png'
import { usuarioSessaoService } from '../../services/usuarioSessaoService'

export default function AcessoApp() {
  const navigate = useNavigate()
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')

  useEffect(() => {
    document.title = 'Soulie | Acessar jornada'
  }, [])

  const soulie = carregando ? souliePositivo : souliePaz

  async function acessar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setCarregando(true)
    setErro('')

    try {
      await usuarioSessaoService.acessar(nomeUsuario.trim(), email.trim().toLowerCase())
      navigate('/app', { replace: true })
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível acessar sua jornada. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <main className="relative flex min-h-screen items-center overflow-hidden bg-white px-5 pb-8 pt-24 text-zinc-900 sm:px-8 sm:pt-28">
      <header className="absolute inset-x-0 top-0 mx-auto flex w-full max-w-[1360px] items-center justify-start px-5 py-6 sm:px-8 sm:py-7">
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-lg px-2 py-2 text-sm font-semibold text-zinc-600 transition hover:text-violet-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4 text-violet-700" />
          Voltar ao site
        </Link>
      </header>

      <div className="relative mx-auto w-full max-w-[710px]">
        <section className="relative z-10 w-full max-w-[710px] rounded-[1.5rem] border border-violet-200 bg-white px-7 py-9 shadow-[0_20px_55px_-42px_rgba(76,29,149,0.4)] sm:px-12 sm:py-10 lg:px-[68px] lg:py-9">
          <div className="text-center">
            <Link to="/" className="text-[2.75rem] font-black leading-none tracking-tight text-violet-700">Soulie</Link>
            <p className="mt-7 text-xs font-bold uppercase tracking-[0.2em] text-violet-700">Sua jornada</p>
            <h1 className="mt-3 text-3xl font-black tracking-tight text-zinc-950 sm:text-[2.65rem]">Continue sua jornada</h1>
            <p className="mt-3 text-sm leading-6 text-zinc-600 sm:text-base">
              Acesse seu espaço e acompanhe seus hábitos com a Soulie.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={acessar}>
            <div>
              <label htmlFor="nomeUsuario" className="mb-2 block text-sm font-semibold text-zinc-800 sm:text-base">Nome</label>
              <input
                id="nomeUsuario"
                name="nomeUsuario"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                value={nomeUsuario}
                onChange={(event) => setNomeUsuario(event.target.value)}
                placeholder="Seu nome"
                className="h-14 w-full rounded-2xl border border-violet-200 bg-violet-50/20 px-5 text-base outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            <div>
              <label htmlFor="email" className="mb-2 block text-sm font-semibold text-zinc-800 sm:text-base">E-mail</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={160}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                className="h-14 w-full rounded-2xl border border-violet-200 bg-violet-50/20 px-5 text-base outline-none transition placeholder:text-zinc-500 focus:border-violet-500 focus:ring-4 focus:ring-violet-100"
              />
            </div>

            {erro && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="inline-flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-violet-700 to-violet-600 px-5 text-base font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-70 sm:text-lg"
            >
              {carregando ? 'Continuando...' : 'Continuar'}
            </button>
          </form>
          <p className="mt-6 text-center text-sm leading-6 text-zinc-500">
            Seu progresso fica salvo na sua jornada.
          </p>
        </section>

        <aside
          className="pointer-events-none absolute left-0 top-1/2 z-20 hidden -translate-x-[85%] -translate-y-1/2 xl:block"
          aria-label="Soulie acompanha seu acesso"
        >
          <img
            src={soulie}
            alt={carregando ? 'Soulie comemorando o acesso' : 'Soulie fazendo sinal de paz ao lado do formulário'}
            className="w-36 object-contain drop-shadow-[0_14px_20px_rgba(109,40,217,0.17)] sm:w-40"
          />
        </aside>
      </div>
    </main>
  )
}
