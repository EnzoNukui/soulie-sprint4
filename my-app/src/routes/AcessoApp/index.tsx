import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import LayoutAcesso from '../../components/LayoutAcesso/LayoutAcesso'
import { ApiError } from '../../services/apiClient'
import { usuarioSessaoService } from '../../services/usuarioSessaoService'

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function AcessoApp() {
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [carregando, setCarregando] = useState(false)
  const [erroCampo, setErroCampo] = useState('')
  const [erro, setErro] = useState('')
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'Soulie | Entrar na jornada'
  }, [])

  async function entrar(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setErro('')

    const emailNormalizado = email.trim().toLowerCase()
    if (!emailNormalizado || !formatoEmail.test(emailNormalizado)) {
      setErroCampo(emailNormalizado ? 'Digite um e-mail válido.' : 'Digite seu e-mail.')
      emailRef.current?.focus()
      return
    }

    setErroCampo('')
    setCarregando(true)
    try {
      await usuarioSessaoService.entrar(emailNormalizado)
      navigate('/app', { replace: true })
    } catch (error) {
      setErro(error instanceof ApiError && error.status === 404
        ? 'Não encontramos uma jornada com este e-mail. Faça seu cadastro para começar.'
        : error instanceof Error ? error.message : 'Não foi possível entrar na sua jornada. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <LayoutAcesso
      titulo="Entre na sua jornada"
      descricao="Informe o e-mail usado no cadastro para continuar de onde parou."
      carregando={carregando}
      rodape={
        <>
          <p>Ainda não tem uma jornada?</p>
          <Link to="/app/cadastro" state={{ email }} className="font-bold text-violet-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-violet-600">Cadastre-se</Link>
        </>
      }
    >
      <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={entrar} noValidate>
        <div>
          <label htmlFor="email-acesso" className="mb-1.5 block text-sm font-semibold text-zinc-800 sm:mb-2 sm:text-base">E-mail</label>
          <input
            ref={emailRef}
            id="email-acesso"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={100}
            value={email}
            onChange={(event) => { setEmail(event.target.value); setErroCampo(''); setErro('') }}
            aria-invalid={Boolean(erroCampo)}
            aria-describedby={erroCampo ? 'erro-email-acesso' : undefined}
            placeholder="seu@email.com"
            className={`h-12 w-full rounded-2xl border px-4 text-base outline-none transition placeholder:text-zinc-500 focus:ring-4 sm:h-14 sm:px-5 ${erroCampo ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-rose-100' : 'border-violet-200 bg-violet-50/20 focus:border-violet-500 focus:ring-violet-100'}`}
          />
          {erroCampo && <p id="erro-email-acesso" role="alert" className="mt-2 text-sm text-rose-700">{erroCampo}</p>}
        </div>

        {erro && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-linear-to-r from-violet-700 to-violet-600 px-5 text-base font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-70 sm:h-16 sm:text-lg"
        >
          {carregando ? 'Entrando...' : 'Entrar'}
        </button>
      </form>
    </LayoutAcesso>
  )
}
