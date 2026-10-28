import type {
  AtualizarMissaoRequest,
  CriarMissaoRequest,
  CriarUsuarioMissaoRequest,
  Missao,
  UsuarioMissao,
} from '../types/api'
import { apiJsonBody, apiRequest } from './apiClient'

export const missaoService = {
  listar: (signal?: AbortSignal) =>
    apiRequest<Missao[]>(
      '/missoes',
      { signal },
    ),
  buscarPorId: (idMissao: number, signal?: AbortSignal) =>
    apiRequest<Missao>(
      `/missoes/${idMissao}`,
      { signal },
    ),
  criar: (dados: CriarMissaoRequest) =>
    apiRequest<Missao>('/missoes', {
      method: 'POST',
      body: apiJsonBody(dados),
    }),
  atualizar: (idMissao: number, dados: AtualizarMissaoRequest) =>
    apiRequest<Missao>(`/missoes/${idMissao}`, {
      method: 'PUT',
      body: apiJsonBody(dados),
    }),
  excluir: (idMissao: number) =>
    apiRequest<void>(
      `/missoes/${idMissao}`,
      {
        method: 'DELETE',
      },
    ),
  listarParticipacoesDoUsuario: (idUsuario: number, signal?: AbortSignal) =>
    apiRequest<UsuarioMissao[]>(
      `/usuario-missoes/usuario/${idUsuario}`,
      { signal },
    ),
  buscarParticipacao: (idUsuario: number, idMissao: number, signal?: AbortSignal) =>
    apiRequest<UsuarioMissao>(
      `/usuario-missoes/${idUsuario}/${idMissao}`,
      { signal },
    ),
  participar: (dados: CriarUsuarioMissaoRequest) =>
    apiRequest<UsuarioMissao>('/usuario-missoes', {
      method: 'POST',
      body: apiJsonBody(dados),
    }),
  sair: (idUsuario: number, idMissao: number) =>
    apiRequest<void>(
      `/usuario-missoes/${idUsuario}/${idMissao}`,
      {
        method: 'DELETE',
      },
    ),
}
