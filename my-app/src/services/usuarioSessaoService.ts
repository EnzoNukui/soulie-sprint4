import { ApiError } from './apiClient'
import { usuarioService } from './usuarioService'
import type { Usuario } from '../types/api'

const CHAVE_JORNADA = 'soulie.identificadorJornada'

export const usuarioSessaoService = {
  async entrar(email: string): Promise<Usuario> {
    const usuario = await usuarioService.buscarPorEmail(email)
    localStorage.setItem(CHAVE_JORNADA, usuario.identificadorJornada)
    return usuario
  },

  async cadastrar(nomeUsuario: string, email: string): Promise<Usuario> {
    try {
      await usuarioService.buscarPorEmail(email)
      throw new Error('Este e-mail já tem uma jornada cadastrada. Use a opção Entrar.')
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error
    }

    const usuario = await usuarioService.cadastrar({ nomeUsuario, email })
    localStorage.setItem(CHAVE_JORNADA, usuario.identificadorJornada)
    return usuario
  },

  async recuperar(signal?: AbortSignal): Promise<Usuario | null> {
    const identificadorJornada = localStorage.getItem(CHAVE_JORNADA)
    if (!identificadorJornada) return null

    try {
      return await usuarioService.buscarPorJornada(identificadorJornada, signal)
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        localStorage.removeItem(CHAVE_JORNADA)
        return null
      }
      throw error
    }
  },

  encerrar(): void {
    localStorage.removeItem(CHAVE_JORNADA)
  },
}
