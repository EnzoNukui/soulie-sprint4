import { House, Target, UsersRound } from 'lucide-react'
import { NavLink } from 'react-router-dom'

const links = [
  { nome: 'Início', caminho: '/app', icone: House, exato: true },
  { nome: 'Missões', caminho: '/app/missoes', icone: Target, exato: false },
  { nome: 'Comunidades', caminho: '/app/comunidades', icone: UsersRound, exato: false },
]

export default function MenuApp() {
  return (
    <>
      <aside className="hidden min-h-screen border-r border-violet-100 bg-white px-6 py-8 lg:sticky lg:top-0 lg:flex lg:flex-col">
        <NavLink to="/app" className="mb-10 text-3xl font-black tracking-tight text-violet-700">
          Soulie
        </NavLink>
        <nav aria-label="Navegação do aplicativo" className="flex flex-col gap-2">
          {links.map(({ nome, caminho, icone: Icone, exato }) => (
            <NavLink
              key={caminho}
              to={caminho}
              end={exato}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  isActive
                    ? 'bg-violet-600 text-white shadow-sm'
                    : 'text-zinc-600 hover:bg-violet-50 hover:text-violet-800'
                }`
              }
            >
              <Icone aria-hidden="true" className="h-5 w-5" />
              {nome}
            </NavLink>
          ))}
        </nav>
        <div className="mt-auto rounded-2xl bg-violet-50 p-4">
          <p className="text-sm font-bold text-violet-950">Sua jornada</p>
          <p className="mt-1 text-xs leading-5 text-zinc-600">Pequenas ações sustentáveis começam por aqui.</p>
        </div>
      </aside>

      <header className="flex items-center justify-between border-b border-violet-100 bg-white px-5 py-4 lg:hidden">
        <NavLink to="/app" className="text-2xl font-black tracking-tight text-violet-700">
          Soulie
        </NavLink>
        <span className="text-xs font-semibold text-zinc-500">Sua jornada sustentável</span>
      </header>

      <nav
        aria-label="Navegação do aplicativo"
        className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-3 border-t border-violet-100 bg-white/95 px-2 py-2 shadow-[0_-8px_24px_-20px_rgba(24,24,27,0.5)] backdrop-blur lg:hidden"
      >
        {links.map(({ nome, caminho, icone: Icone, exato }) => (
          <NavLink
            key={caminho}
            to={caminho}
            end={exato}
            className={({ isActive }) =>
              `flex flex-col items-center gap-1 rounded-xl px-2 py-2 text-[11px] font-semibold ${
                isActive ? 'text-violet-700' : 'text-zinc-500'
              }`
            }
          >
            <Icone aria-hidden="true" className="h-5 w-5" />
            {nome}
          </NavLink>
        ))}
      </nav>
    </>
  )
}
