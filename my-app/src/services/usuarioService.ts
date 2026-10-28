import type { AtualizarUsuarioRequest, CriarUsuarioRequest, Usuario } from '../types/api'
import { apiJsonBody, apiRequest } from './apiClient'

export const usuarioService = {
  listar: (signal?: AbortSignal) =>
    apiRequest<Usuario[]>(
      '/usuarios',
      { signal },
    ),
  buscarPorId: (idUsuario: number, signal?: AbortSignal) =>
    apiRequest<Usuario>(
      `/usuarios/${idUsuario}`,
      { signal },
    ),
  buscarPorEmail: (email: string, signal?: AbortSignal) =>
    apiRequest<Usuario>(
      `/usuarios/email?email=${encodeURIComponent(email)}`,
      { signal },
    ),
  buscarPorJornada: (identificadorJornada: string, signal?: AbortSignal) =>
    apiRequest<Usuario>(
      `/usuarios/jornada/${encodeURIComponent(identificadorJornada)}`,
      { signal },
    ),
  cadastrar: (dados: CriarUsuarioRequest) =>
    apiRequest<Usuario>('/usuarios', {
      method: 'POST',
      body: apiJsonBody(dados),
    }),
  atualizar: (idUsuario: number, dados: AtualizarUsuarioRequest) =>
    apiRequest<Usuario>(`/usuarios/${idUsuario}`, {
      method: 'PUT',
      body: apiJsonBody(dados),
    }),
  excluir: (idUsuario: number) =>
    apiRequest<void>(
      `/usuarios/${idUsuario}`,
      {
        method: 'DELETE',
      },
    ),
}
