export type LocalDate = string
export type LocalDateTime = string

export interface Usuario {
  idUsuario: number
  nomeUsuario: string
  email: string
  pontosAcumulados: number
  status: 'A' | 'I'
  identificadorJornada: string
}

export type CriarUsuarioRequest = Pick<Usuario, 'nomeUsuario' | 'email'>
export type AtualizarUsuarioRequest = Pick<Usuario, 'nomeUsuario' | 'email'>

export interface Avatar {
  idAvatar: number
  idUsuario: number
  nivelEvolucao: number
  experiencia: number
  temperamento: string
}

export type AtualizarAvatarRequest = Omit<Avatar, 'idAvatar'>

export interface Streak {
  idStreak: number
  idUsuario: number
  diasConsecutivos: number
  dataUltimaAtividade: LocalDate
}

export interface Missao {
  idMissao: number
  nome: string
  descricao: string
  pontosRecompensa: number
  idUsuarioCriador: number | null
  metaDias: number
}

export type CriarMissaoRequest = Omit<Missao, 'idMissao'> & {
  idUsuarioCriador: number
}
export type AtualizarMissaoRequest = CriarMissaoRequest

export interface UsuarioMissao {
  idUsuario: number
  idMissao: number
  dataInicio: LocalDate
  dataConclusao: LocalDate | null
  status: 'EM_ANDAMENTO' | 'CONCLUIDA'
}

export type CriarUsuarioMissaoRequest = Pick<UsuarioMissao, 'idUsuario' | 'idMissao' | 'dataInicio'>

export interface Atividade {
  idRegistro: number
  idUsuario: number
  idMissao: number
  dataRegistro: LocalDate
  observacao: string | null
}

export type CriarAtividadeRequest = Pick<Atividade, 'idUsuario' | 'idMissao'> & {
  observacao?: string | null
}
export type AtualizarAtividadeRequest = Pick<Atividade, 'idUsuario' | 'idMissao' | 'observacao'>

export interface Conquista {
  idConquista: number
  nome: string
  descricao: string
}

export type CriarConquistaRequest = Omit<Conquista, 'idConquista'>
export type AtualizarConquistaRequest = CriarConquistaRequest

export interface UsuarioConquista {
  idUsuario: number
  idConquista: number
  dataConquista: LocalDate
}

export interface Comunidade {
  idComunidade: number
  nome: string
  tema: string
}

export type CriarComunidadeRequest = Omit<Comunidade, 'idComunidade'>
export type AtualizarComunidadeRequest = CriarComunidadeRequest

export interface UsuarioComunidade {
  idUsuario: number
  idComunidade: number
  dataIngresso: LocalDate
}

export type CriarUsuarioComunidadeRequest = UsuarioComunidade
export type AtualizarUsuarioComunidadeRequest = UsuarioComunidade

export interface Postagem {
  idPostagem: number
  idUsuario: number
  idComunidade: number
  titulo: string
  conteudo: string
  dataPostagem: LocalDateTime
}

export type CriarPostagemRequest = Omit<Postagem, 'idPostagem'>
export type AtualizarPostagemRequest = Omit<Postagem, 'idPostagem'>

export type EstadoRequisicao<T> =
  | { status: 'idle' | 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; message: string }
