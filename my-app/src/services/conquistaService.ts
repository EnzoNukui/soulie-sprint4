import type {
  AtualizarConquistaRequest,
  Conquista,
  CriarConquistaRequest,
  UsuarioConquista,
} from '../types/api'
import { apiJsonBody, apiRequest } from './apiClient'

export const conquistaService = {
  listar: (signal?: AbortSignal) =>
    apiRequest<Conquista[]>(
      '/conquistas',
      { signal },
    ),
  buscarPorId: (idConquista: number, signal?: AbortSignal) =>
    apiRequest<Conquista>(
      `/conquistas/${idConquista}`,
      { signal },
    ),
  criar: (dados: CriarConquistaRequest) =>
    apiRequest<Conquista>('/conquistas', {
      method: 'POST',
      body: apiJsonBody(dados),
    }),
  atualizar: (idConquista: number, dados: AtualizarConquistaRequest) =>
    apiRequest<Conquista>(`/conquistas/${idConquista}`, {
      method: 'PUT',
      body: apiJsonBody(dados),
    }),
  excluir: (idConquista: number) =>
    apiRequest<void>(
      `/conquistas/${idConquista}`,
      {
        method: 'DELETE',
      },
    ),
  listarDoUsuario: (idUsuario: number, signal?: AbortSignal) =>
    apiRequest<UsuarioConquista[]>(
      `/usuario-conquistas/usuario/${idUsuario}`,
      { signal },
    ),
  listarPorConquista: (idConquista: number, signal?: AbortSignal) =>
    apiRequest<UsuarioConquista[]>(
      `/usuario-conquistas/conquista/${idConquista}`,
      { signal },
    ),
  buscarConquistaDoUsuario: (idUsuario: number, idConquista: number, signal?: AbortSignal) =>
    apiRequest<UsuarioConquista>(
      `/usuario-conquistas/${idUsuario}/${idConquista}`,
      { signal },
    ),
}
