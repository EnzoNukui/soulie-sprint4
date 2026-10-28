import type { Streak } from '../types/api'
import { apiRequest } from './apiClient'

export const streakService = {
  listar: (signal?: AbortSignal) =>
    apiRequest<Streak[]>(
      '/streaks',
      { signal },
    ),
  buscarPorId: (idStreak: number, signal?: AbortSignal) =>
    apiRequest<Streak>(
      `/streaks/${idStreak}`,
      { signal },
    ),
  buscarPorUsuario: (idUsuario: number, signal?: AbortSignal) =>
    apiRequest<Streak>(
      `/streaks/usuario/${idUsuario}`,
      { signal },
    ),
}
