import type { AtualizarPostagemRequest, CriarPostagemRequest, Postagem } from '../types/api'
import { apiJsonBody, apiRequest } from './apiClient'

export const postagemService = {
  listar: (signal?: AbortSignal) =>
    apiRequest<Postagem[]>(
      '/postagens',
      { signal },
    ),
  buscarPorId: (idPostagem: number, signal?: AbortSignal) =>
    apiRequest<Postagem>(
      `/postagens/${idPostagem}`,
      { signal },
    ),
  listarDoUsuario: (idUsuario: number, signal?: AbortSignal) =>
    apiRequest<Postagem[]>(
      `/postagens/usuario/${idUsuario}`,
      { signal },
    ),
  listarDaComunidade: (idComunidade: number, signal?: AbortSignal) =>
    apiRequest<Postagem[]>(
      `/postagens/comunidade/${idComunidade}`,
      { signal },
    ),
  criar: (dados: CriarPostagemRequest) =>
    apiRequest<Postagem>('/postagens', {
      method: 'POST',
      body: apiJsonBody(dados),
    }),
  atualizar: (idPostagem: number, dados: AtualizarPostagemRequest) =>
    apiRequest<Postagem>(`/postagens/${idPostagem}`, {
      method: 'PUT',
      body: apiJsonBody(dados),
    }),
  excluir: (idPostagem: number) =>
    apiRequest<void>(
      `/postagens/${idPostagem}`,
      {
        method: 'DELETE',
      },
    ),
}
