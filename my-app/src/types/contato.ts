export type TipoProblema =
  | 'duvida'
  | 'problema-tecnico'
  | 'sugestao'
  | 'feedback'
  | 'outro'

export interface FormularioContato {
  email: string
  assunto: string
  descricao: string
  tipoProblema: TipoProblema
}
