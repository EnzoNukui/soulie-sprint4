const API_URL = import.meta.env.VITE_API_URL?.replace(/\/+$/, '')

export class ApiError extends Error {
  public readonly status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = 'ApiError'
    this.status = status
  }
}

function mensagemDeErro(payload: unknown, status: number): string {
  if (typeof payload === 'string' && payload.trim()) return payload

  if (payload && typeof payload === 'object') {
    const corpo = payload as Record<string, unknown>
    const mensagem = corpo.message ?? corpo.error ?? corpo.detail
    if (typeof mensagem === 'string' && mensagem.trim()) return mensagem
  }

  return `A API respondeu com o status ${status}.`
}

export async function apiRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  if (!API_URL) {
    throw new Error('A URL da API não foi configurada. Defina VITE_API_URL no ambiente.')
  }

  const headers = new Headers(init.headers)
  headers.set('Accept', 'application/json')
  if (init.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json')
  }

  let response: Response
  try {
    response = await fetch(`${API_URL}${path.startsWith('/') ? path : `/${path}`}`, {
      ...init,
      headers,
    })
  } catch (error) {
    if (error instanceof DOMException && error.name === 'AbortError') throw error
    throw new Error('Não foi possível conectar à API. Verifique sua conexão e tente novamente.')
  }

  if (response.status === 204) return undefined as T

  const responseText = await response.text()
  let payload: unknown = responseText || undefined
  if (responseText && response.headers.get('Content-Type')?.includes('application/json')) {
    try {
      payload = JSON.parse(responseText) as unknown
    } catch {
      payload = responseText
    }
  }

  if (!response.ok) {
    throw new ApiError(mensagemDeErro(payload, response.status), response.status)
  }

  if (!responseText) return undefined as T
  return payload as T
}

export function apiJsonBody(body: unknown): string {
  return JSON.stringify(body)
}
