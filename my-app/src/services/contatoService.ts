import type { FormularioContato, TipoProblema } from '../types/contato'

const EMAILJS_URL = 'https://api.emailjs.com/api/v1.0/email/send'

const tiposProblema: Record<TipoProblema, string> = {
  duvida: 'Dúvida sobre a Soulie',
  'problema-tecnico': 'Problema técnico',
  sugestao: 'Sugestão de melhoria',
  feedback: 'Feedback sobre o projeto',
  outro: 'Outro assunto',
}

export const contatoService = {
  async enviar(dados: FormularioContato): Promise<void> {
    const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID?.trim()
    const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID?.trim()
    const publicKey = import.meta.env.VITE_EMAILJS_PUBLIC_KEY?.trim()

    if (!serviceId || !templateId || !publicKey) {
      throw new Error('O envio de mensagens ainda não está configurado. Tente novamente mais tarde.')
    }

    let resposta: Response
    try {
      resposta = await fetch(EMAILJS_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          service_id: serviceId,
          template_id: templateId,
          user_id: publicKey,
          template_params: {
            email: dados.email,
            assunto: dados.assunto,
            descricao: dados.descricao,
            tipo_problema: tiposProblema[dados.tipoProblema],
          },
        }),
      })
    } catch {
      throw new Error('Não foi possível conectar ao serviço de mensagens. Tente novamente.')
    }

    if (!resposta.ok) {
      throw new Error('Não foi possível enviar sua mensagem. Confira os dados e tente novamente.')
    }
  },
}
