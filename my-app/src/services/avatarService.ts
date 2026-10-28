import type { AtualizarAvatarRequest, Avatar } from '../types/api'
import { apiJsonBody, apiRequest } from './apiClient'

export const avatarService = {
  listar: (signal?: AbortSignal) =>
    apiRequest<Avatar[]>(
      '/avatares',
      { signal },
    ),
  buscarPorId: (idAvatar: number, signal?: AbortSignal) =>
    apiRequest<Avatar>(
      `/avatares/${idAvatar}`,
      { signal },
    ),
  buscarPorUsuario: (idUsuario: number, signal?: AbortSignal) =>
    apiRequest<Avatar>(
      `/avatares/usuario/${idUsuario}`,
      { signal },
    ),
  atualizar: (idAvatar: number, dados: AtualizarAvatarRequest) =>
    apiRequest<Avatar>(`/avatares/${idAvatar}`, {
      method: 'PUT',
      body: apiJsonBody(dados),
    }),
}
