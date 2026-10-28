import type { Atividade, AtualizarAtividadeRequest, CriarAtividadeRequest } from '../types/api'
import { apiJsonBody, apiRequest } from './apiClient'

export const atividadeService = {
  listar: (signal?: AbortSignal) =>
    apiRequest<Atividade[]>(
      '/atividades',
      { signal },
    ),
  listarDoUsuario: (idUsuario: number, signal?: AbortSignal) =>
    apiRequest<Atividade[]>(
      `/atividades/usuario/${idUsuario}`,
      { signal },
    ),
  listarDaMissao: (idMissao: number, signal?: AbortSignal) =>
    apiRequest<Atividade[]>(
      `/atividades/missao/${idMissao}`,
      { signal },
    ),
  buscarPorId: (idRegistro: number, signal?: AbortSignal) =>
    apiRequest<Atividade>(
      `/atividades/${idRegistro}`,
      { signal },
    ),
  registrar: (dados: CriarAtividadeRequest) =>
    apiRequest<Atividade>('/atividades', {
      method: 'POST',
      body: apiJsonBody(dados),
    }),
  atualizar: (idRegistro: number, dados: AtualizarAtividadeRequest) =>
    apiRequest<Atividade>(`/atividades/${idRegistro}`, {
      method: 'PUT',
      body: apiJsonBody(dados),
    }),
  excluir: (idRegistro: number) =>
    apiRequest<void>(`/atividades/${idRegistro}`, {
      method: 'DELETE',
    }),
}
