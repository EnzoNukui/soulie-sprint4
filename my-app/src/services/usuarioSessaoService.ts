import { ApiError } from './apiClient'
import { usuarioService } from './usuarioService'
import type { Usuario } from '../types/api'

const CHAVE_JORNADA = 'soulie.identificadorJornada'

export const usuarioSessaoService = {
  async acessar(nomeUsuario: string, email: string): Promise<Usuario> {
    let usuario: Usuario

    try {
      usuario = await usuarioService.buscarPorEmail(email)
    } catch (error) {
      if (!(error instanceof ApiError) || error.status !== 404) throw error
      usuario = await usuarioService.cadastrar({ nomeUsuario, email })
    }

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
