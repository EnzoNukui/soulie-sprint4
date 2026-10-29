import { createContext, useContext } from 'react'

export interface EtapaTutorialSoulie {
  alvo: string
  titulo: string
  descricao: string
  exemplo?: string
  preparar?: () => void
  avancarAoClicar?: boolean
  encerrarAoClicar?: boolean
  rotuloProximo?: string
}

export interface TutorialSoulie {
  id: string
  titulo: string
  imagem?: string
  etapas: EtapaTutorialSoulie[]
}

export const TutorialSoulieContext = createContext<{
  ativo: boolean
  iniciarTutorial: (tutorial: TutorialSoulie) => void
} | null>(null)

export function useTutorialSoulie() {
  const contexto = useContext(TutorialSoulieContext)
  if (!contexto) throw new Error('O guia precisa estar dentro do aplicativo Soulie.')
  return contexto
}
