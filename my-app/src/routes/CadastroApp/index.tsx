import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import LayoutAcesso from '../../components/LayoutAcesso/LayoutAcesso'
import { ApiError } from '../../services/apiClient'
import { usuarioSessaoService } from '../../services/usuarioSessaoService'

type ErrosCampos = Partial<Record<'nomeUsuario' | 'email', string>>

const formatoEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export default function CadastroApp() {
  const navigate = useNavigate()
  const location = useLocation()
  const emailRecebido = (location.state as { email?: unknown } | null)?.email
  const [nomeUsuario, setNomeUsuario] = useState('')
  const [email, setEmail] = useState(typeof emailRecebido === 'string' ? emailRecebido : '')
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState('')
  const [errosCampos, setErrosCampos] = useState<ErrosCampos>({})
  const nomeRef = useRef<HTMLInputElement>(null)
  const emailRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    document.title = 'Soulie | Criar jornada'
  }, [])

  async function cadastrar(event: React.FormEvent<HTMLFormElement>) {
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
      await usuarioSessaoService.cadastrar(nomeNormalizado, emailNormalizado)
      navigate('/app', { replace: true })
    } catch (error) {
      setErro(error instanceof ApiError && error.status === 400
        ? 'Não foi possível concluir o cadastro. Confira os dados ou entre se já tiver uma jornada.'
        : error instanceof Error ? error.message : 'Não foi possível criar sua jornada. Tente novamente.')
    } finally {
      setCarregando(false)
    }
  }

  return (
    <LayoutAcesso
      titulo="Crie sua jornada"
      descricao="Cadastre seu nome e e-mail para começar a jornada com a Soulie."
      carregando={carregando}
      rodape={
        <>
          <p>Já tem uma jornada?</p>
          <Link to="/app/acesso" className="font-bold text-violet-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600">Entrar</Link>
        </>
      }
    >
      <form className="mt-6 space-y-4 sm:mt-8 sm:space-y-5" onSubmit={cadastrar} noValidate>
        <div>
          <label htmlFor="nomeUsuario" className="mb-1.5 block text-sm font-semibold text-zinc-800 sm:mb-2 sm:text-base">Nome</label>
          <input
            ref={nomeRef}
            id="nomeUsuario"
            name="nomeUsuario"
            autoComplete="name"
            required
            minLength={2}
            maxLength={50}
            value={nomeUsuario}
            onChange={(event) => { setNomeUsuario(event.target.value); setErrosCampos((atuais) => ({ ...atuais, nomeUsuario: undefined })); setErro('') }}
            aria-invalid={Boolean(errosCampos.nomeUsuario)}
            aria-describedby={errosCampos.nomeUsuario ? 'erro-nome-usuario' : undefined}
            placeholder="Seu nome"
            className={`h-12 w-full rounded-2xl border px-4 text-base outline-none transition placeholder:text-zinc-500 focus:ring-4 sm:h-14 sm:px-5 ${errosCampos.nomeUsuario ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-rose-100' : 'border-violet-200 bg-violet-50/20 focus:border-violet-500 focus:ring-violet-100'}`}
          />
          {errosCampos.nomeUsuario && <p id="erro-nome-usuario" role="alert" className="mt-2 text-sm text-rose-700">{errosCampos.nomeUsuario}</p>}
        </div>

        <div>
          <label htmlFor="email-cadastro" className="mb-1.5 block text-sm font-semibold text-zinc-800 sm:mb-2 sm:text-base">E-mail</label>
          <input
            ref={emailRef}
            id="email-cadastro"
            name="email"
            type="email"
            autoComplete="email"
            required
            maxLength={100}
            value={email}
            onChange={(event) => { setEmail(event.target.value); setErrosCampos((atuais) => ({ ...atuais, email: undefined })); setErro('') }}
            aria-invalid={Boolean(errosCampos.email)}
            aria-describedby={errosCampos.email ? 'erro-email-cadastro' : undefined}
            placeholder="seu@email.com"
            className={`h-12 w-full rounded-2xl border px-4 text-base outline-none transition placeholder:text-zinc-500 focus:ring-4 sm:h-14 sm:px-5 ${errosCampos.email ? 'border-rose-500 bg-rose-50/30 focus:border-rose-600 focus:ring-rose-100' : 'border-violet-200 bg-violet-50/20 focus:border-violet-500 focus:ring-violet-100'}`}
          />
          {errosCampos.email && <p id="erro-email-cadastro" role="alert" className="mt-2 text-sm text-rose-700">{errosCampos.email}</p>}
        </div>

        {erro && <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm leading-5 text-rose-800">{erro}</p>}

        <button
          type="submit"
          disabled={carregando}
          className="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-linear-to-r from-violet-700 to-violet-600 px-5 text-base font-bold text-white shadow-sm transition hover:brightness-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-violet-600 disabled:cursor-wait disabled:opacity-70 sm:h-16 sm:text-lg"
        >
          {carregando ? 'Criando jornada...' : 'Cadastrar'}
        </button>
      </form>
    </LayoutAcesso>
  )
}
