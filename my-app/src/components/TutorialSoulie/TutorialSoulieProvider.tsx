import { useCallback, useRef, useState, type ReactNode } from 'react'
import { TutorialSoulieContext, type TutorialSoulie } from './TutorialSoulieContext'
import TutorialSoulieOverlay from './TutorialSoulieOverlay'

export default function TutorialSoulieProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<{ tutorial: TutorialSoulie; etapa: number } | null>(null)
  const origemRef = useRef<HTMLElement | null>(null)

  const iniciarTutorial = useCallback((tutorial: TutorialSoulie) => {
    if (!tutorial.etapas.length) return
    origemRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null
    setSessao({ tutorial, etapa: 0 })
  }, [])

  const encerrar = useCallback(() => {
    setSessao(null)
    requestAnimationFrame(() => {
      const podeRetornar = origemRef.current?.isConnected && origemRef.current.matches('a[href], button, input, select, textarea, [tabindex]')
      const origem = podeRetornar ? origemRef.current : document.querySelector<HTMLElement>('[data-soulie-launcher]')
      origem?.focus({ preventScroll: true })
    })
  }, [])

  const mudarEtapa = useCallback((deslocamento: number) => setSessao((atual) => atual ? {
    ...atual,
    etapa: Math.max(0, Math.min(atual.tutorial.etapas.length - 1, atual.etapa + deslocamento)),
  } : null), [])

  return (
    <TutorialSoulieContext.Provider value={{ ativo: Boolean(sessao), iniciarTutorial }}>
      {children}
      {sessao && (
        <TutorialSoulieOverlay
          key={sessao.tutorial.id + '-' + sessao.etapa}
          tutorial={sessao.tutorial}
          indice={sessao.etapa}
          encerrar={encerrar}
          mudarEtapa={mudarEtapa}
        />
      )}
    </TutorialSoulieContext.Provider>
  )
}
