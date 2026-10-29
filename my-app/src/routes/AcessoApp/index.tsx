import { useEffect, useRef, useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import souliePaz from '../../assets/avatar/integrantes/soulie-paz.png'
import souliePositivo from '../../assets/avatar/integrantes/soulie-positivo.png'
import { usuarioSessaoService } from '../../services/usuarioSessaoService'

type ErrosCampos = Partial<Record<'nomeUsuario' | 'email', string>>

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AcessoApp() {
  const navigate = useNavigate()
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState<ErrosCampos>({})
  const nomeRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'Soulie | Acessar jornada'
  }, [])

  const soulie = carregando ? souliePositivo : souliePaz

  async function acessar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    const nomeNormalizado = nomeUsuario.trim()
    const emailNormalizado = email.trim().toLowerCase()
    const novosErros: ErrosCampos = {}

    if (nomeNormalizado.length < 2) {
      novosErros.nomeUsuario = 'Digite um nome com pelo menos 2 caracteres, além de espaços.'
    }
    if (!emailNormalizado) {
      novosErros.email = 'Digite seu e-mail.'
    } else if (!formatoEmail.test(emailNormalizado)) {
      novosErros.email = 'Digite um e-mail válido.'
    }

    setErrosCampos(novosErros)
    if (Object.keys(novosErros).length > 0) {
      if (novosErros.nomeUsuario) nomeRef.current?.focus()
      else emailRef.current?.focus()
      return
    }

    setCarregando(true)

    try {
      await usuarioSessaoService.acessar(nomeNormalizado, emailNormalizado)
      navigate('/app', { replace: true })
    } catch (error) {
      setErro(error instanceof Error ? error.message : 'Não foi possível acessar sua jornada. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

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
            <h1 className="mt-3 text-2xl font-black tracking-tight text-zinc-950 sm:text-[2.65rem]">Continue sua jornada</h1>
            <p className="mt-2 text-sm leading-5 text-zinc-600 sm:mt-3 sm:text-base sm:leading-6">
              Acesse seu espaço e acompanhe seus hábitos com a Soulie.
            </p>
          </div>

          <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={acessar} noValidate>
            <div>
              <label htmlFor="nomeUsuario" className="mb-1.5 block text-sm font-semibold text-zinc-800 sm:mb-2 sm:text-base">Nome</label>
              <input
                ref={nomeRef}
                id="nomeUsuario"
                name="nomeUsuario"
                autoComplete="name"
                required
                minLength={2}
                maxLength={120}
                value={nomeUsuario}
                onChange={(event) => {
                  setNomeUsuario(event.target.value)
                  setErrosCampos((atuais) => ({ ...atuais, nomeUsuario: undefined }))
                }}
                aria-invalid={Boolean(errosCampos.nomeUsuario)}
                aria-describedby={errosCampos.nomeUsuario ? 'erro-nome-usuario' : undefined}
                placeholder="Seu nome"
                className={`h-12 w-full rounded-2xl border px-4 text-base outline-none transition placeholder:text-zinc-500 focus:ring-4 sm:h-14 sm:px-5 ${errosCampos.nomeUsuario ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-rose-100' : 'border-violet-200 bg-violet-50/20 focus:border-violet-500 focus:ring-violet-100'}`}
              />
              {errosCampos.nomeUsuario && (
                <p id="erro-nome-usuario" role="alert" className="mt-2 text-sm text-rose-700">{errosCampos.nomeUsuario}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1.5 block text-sm font-semibold text-zinc-800 sm:mb-2 sm:text-base">E-mail</label>
              <input
                ref={emailRef}
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                maxLength={160}
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value)
                  setErrosCampos((atuais) => ({ ...atuais, email: undefined }))
                }}
                aria-invalid={Boolean(errosCampos.email)}
                aria-describedby={errosCampos.email ? 'erro-email-acesso' : undefined}
                placeholder="seu@email.com"
                className={`h-12 w-full rounded-2xl border px-4 text-base outline-none transition placeholder:text-zinc-500 focus:ring-4 sm:h-14 sm:px-5 ${errosCampos.email ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-rose-100' : 'border-violet-200 bg-violet-50/20 focus:border-violet-500 focus:ring-violet-100'}`}
              />
              {errosCampos.email && (
                <p id="erro-email-acesso" role="alert" className="mt-2 text-sm text-rose-700">{errosCampos.email}</p>
              )}
            </div>

            {erro && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800">{erro}</p>}

            <button
              type="submit"
              disabled={carregando}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-2xl bg-linear-to-r from-violet-700 to-violet-600 px-5 text-base font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-70 sm:h-16 sm:text-lg"
            >
              {carregando ? 'Continuando...' : 'Continuar'}
            </button>
          </form>
          <p className="mt-4 text-center text-xs leading-5 text-zinc-500 sm:mt-6 sm:text-sm sm:leading-6">
            Seu progresso fica salvo na sua jornada.
          </p>
        </section>

        <aside
          className="pointer-events-none absolute left-0 top-1/2 z-20 hidden translate-x-[-85%] -translate-y-1/2 xl:block"
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
