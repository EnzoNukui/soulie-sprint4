import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useTutorialSoulie, type TutorialSoulie } from './TutorialSoulieContext'

export default function useTutorialSolicitado(tutoriais: Record<string, TutorialSoulie | undefined>, pronto = true) {
  const location = useLocation()
  const navigate = useNavigate()
  const { iniciarTutorial } = useTutorialSoulie()
  const pedidoConsumido = useRef<string | null>(null)

  useEffect(() => {
    const estado = location.state as { tutorialSoulie?: string } | null
    if (!pronto || !estado?.tutorialSoulie) return
    const pedido = location.key + ':' + estado.tutorialSoulie
    if (pedidoConsumido.current === pedido) return
    pedidoConsumido.current = pedido
    const tutorial = tutoriais[estado.tutorialSoulie]
    navigate(location.pathname + location.search + location.hash, { replace: true, state: { ...estado, tutorialSoulie: undefined } })
    if (tutorial) iniciarTutorial(tutorial)
  }, [location, navigate, iniciarTutorial, pronto, tutoriais])
}
