import { useEffect, useLayoutEffect, useState } from 'react'
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom'
import MenuApp from '../MenuApp/MenuApp'
import { usuarioSessaoService } from '../../services/usuarioSessaoService'
import type { Usuario } from '../../types/api'

type EstadoUsuarioSessao =
  | { status: 'loading' }
  | { status: 'success'; data: Usuario | null }
  | { status: 'error'; message: string }

export default function LayoutApp() {
  const { pathname } = useLocation()
  const [usuario, setUsuario] = useState<EstadoUsuarioSessao>({ status: 'loading' })

  useLayoutEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  useEffect(() => {
    const controller = new AbortController()
    usuarioSessaoService
      .recuperar(controller.signal)
      .then((data) => setUsuario({ status: 'success', data }))
      .catch((error: unknown) => {
        if (controller.signal.aborted) return
        setUsuario({
          status: 'error',
          message: error instanceof Error ? error.message : 'Não foi possível recuperar sua jornada.',
        })
      })

    return () => controller.abort()
  }, [])

  if (usuario.status === 'loading') {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbfafc] px-5 text-center" aria-live="polite">
        <p className="text-sm font-semibold text-violet-800">Carregando sua jornada...</p>
      </main>
    )
  }

  if (usuario.status === 'error') {
    return (
      <main className="grid min-h-screen place-items-center bg-[#fbfafc] px-5">
        <section className="max-w-lg rounded-3xl border border-violet-100 bg-white p-8 text-center shadow-sm">
          <h1 className="text-xl font-bold text-violet-950">Não conseguimos abrir sua jornada</h1>
          <p className="mt-3 leading-6 text-zinc-600">{usuario.message}</p>
          <Link to="/app/acesso" className="mt-6 inline-flex rounded-xl bg-violet-600 px-5 py-3 text-sm font-semibold text-white hover:bg-violet-700">
            Voltar ao acesso
          </Link>
        </section>
      </main>
    )
  }

  if (!usuario.data) return <Navigate to="/app/acesso" replace />

  return (
    <div className="min-h-screen bg-[#fbfafc] text-zinc-900 lg:grid lg:grid-cols-[252px_minmax(0,1fr)]">
      <MenuApp />
      <div className="min-w-0 pb-20 lg:pb-0">
        <Outlet context={usuario.data} />
      </div>
    </div>
  )
}
