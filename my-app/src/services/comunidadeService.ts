import type {
  AtualizarComunidadeRequest,
  AtualizarUsuarioComunidadeRequest,
  Comunidade,
  CriarComunidadeRequest,
  CriarUsuarioComunidadeRequest,
  UsuarioComunidade,
} from '../types/api'
import { apiJsonBody, apiRequest } from './apiClient'

export const comunidadeService = {
  listar: (signal?: AbortSignal) =>
    apiRequest<Comunidade[]>(
      '/comunidades',
      { signal },
    ),
  buscarPorId: (idComunidade: number, signal?: AbortSignal) =>
    apiRequest<Comunidade>(
      `/comunidades/${idComunidade}`,
      { signal },
    ),
  criar: (dados: CriarComunidadeRequest) =>
    apiRequest<Comunidade>('/comunidades', {
      method: 'POST',
      body: apiJsonBody(dados),
    }),
  atualizar: (idComunidade: number, dados: AtualizarComunidadeRequest) =>
    apiRequest<Comunidade>(`/comunidades/${idComunidade}`, {
      method: 'PUT',
      body: apiJsonBody(dados),
    }),
  excluir: (idComunidade: number) =>
    apiRequest<void>(`/comunidades/${idComunidade}`, {
      method: 'DELETE',
    }),
  listarDoUsuario: (idUsuario: number, signal?: AbortSignal) =>
    apiRequest<UsuarioComunidade[]>(
      `/usuario-comunidades/usuario/${idUsuario}`,
      { signal },
    ),
  listarParticipantes: (idComunidade: number, signal?: AbortSignal) =>
    apiRequest<UsuarioComunidade[]>(
      `/usuario-comunidades/comunidade/${idComunidade}`,
      { signal },
    ),
  buscarParticipacao: (idUsuario: number, idComunidade: number, signal?: AbortSignal) =>
    apiRequest<UsuarioComunidade>(
      `/usuario-comunidades/${idUsuario}/${idComunidade}`,
      { signal },
    ),
  participar: (dados: CriarUsuarioComunidadeRequest) =>
    apiRequest<UsuarioComunidade>('/usuario-comunidades', {
      method: 'POST',
      body: apiJsonBody(dados),
    }),
  atualizarParticipacao: (
    idUsuario: number,
    idComunidade: number,
    dados: AtualizarUsuarioComunidadeRequest,
  ) =>
    apiRequest<UsuarioComunidade>(
      `/usuario-comunidades/${idUsuario}/${idComunidade}`,
      {
        method: 'PUT',
        body: apiJsonBody(dados),
      },
    ),
  sair: (idUsuario: number, idComunidade: number) =>
    apiRequest<void>(`/usuario-comunidades/${idUsuario}/${idComunidade}`, {
      method: 'DELETE',
    }),
}
