import type { TutorialSoulie } from './TutorialSoulieContext'

export function tutorialCriarComunidade(abrir: () => void, fechar: () => void): TutorialSoulie {
  return {
    id: 'criar-comunidade', titulo: 'Criar comunidade', etapas: [
      { alvo: 'criar-comunidade', titulo: 'Abra o formulário', descricao: 'Este botão inicia seu novo grupo. Vamos preencher juntos.', preparar: fechar, avancarAoClicar: true, rotuloProximo: 'Abrir formulário' },
      { alvo: 'nome-comunidade', titulo: 'Dê um nome ao grupo', descricao: 'Escolha um nome que ajude as pessoas a entender a proposta.', exemplo: 'Ex.: Reciclagem no bairro', preparar: abrir },
      { alvo: 'tema-comunidade', titulo: 'Escolha o tema', descricao: 'Selecione o assunto principal. Ele ajuda outras pessoas a encontrar seu grupo.', exemplo: 'Para o exemplo anterior, escolha Reciclagem.' },
      { alvo: 'salvar-comunidade', titulo: 'Confira e crie', descricao: 'Com nome e tema preenchidos, toque em Criar comunidade. O grupo vai aparecer na lista.' },
    ],
  }
}

export function tutorialCriarMissao(abrir: () => void, fechar: () => void): TutorialSoulie {
  return {
    id: 'criar-missao', titulo: 'Criar missão', etapas: [
      { alvo: 'criar-missao', titulo: 'Proponha um desafio', descricao: 'Comece por este botão para abrir o formulário.', preparar: fechar, avancarAoClicar: true, rotuloProximo: 'Abrir formulário' },
      { alvo: 'nome-missao', titulo: 'Escreva a ação', descricao: 'Use um nome curto que diga o que a pessoa deve fazer.', exemplo: 'Ex.: Leve sua própria garrafa', preparar: abrir },
      { alvo: 'descricao-missao', titulo: 'Explique como fazer', descricao: 'Descreva a ação com detalhes que ajudem alguém a começar.', exemplo: 'Ex.: Leve uma garrafa reutilizável nos seus deslocamentos.' },
      { alvo: 'meta-missao', titulo: 'Defina quantos dias', descricao: 'A meta indica por quantos dias a ação deve ser registrada.', exemplo: 'Ex.: 7 dias para praticar durante uma semana.' },
      { alvo: 'pontos-missao', titulo: 'Escolha os pontos', descricao: 'Esta é a recompensa em pontos por concluir a missão.' },
      { alvo: 'salvar-missao', titulo: 'Publique o desafio', descricao: 'Revise os campos e toque em Cadastrar missão. Ela ficará disponível na lista.' },
    ],
  }
}

export function tutorialPublicar(campos: { titulo: string; conteudo: string; enviar: string; grupo?: string }): TutorialSoulie {
  return {
    id: 'publicar', titulo: 'Publicar uma ideia', etapas: [
      { alvo: campos.titulo, titulo: 'Resuma sua ideia', descricao: 'Escreva um título curto para a publicação.', exemplo: 'Ex.: Hoje fui a pé até o mercado' },
      ...(campos.grupo ? [{ alvo: campos.grupo, titulo: 'Escolha a comunidade', descricao: 'Selecione em qual dos seus grupos a mensagem deve aparecer.' }] : []),
      { alvo: campos.conteudo, titulo: 'Conte sua experiência', descricao: 'Compartilhe o que você fez, aprendeu ou quer perguntar ao grupo.' },
      { alvo: campos.enviar, titulo: 'Revise e compartilhe', descricao: 'Quando o texto estiver pronto, toque em Publicar. A mensagem aparecerá para a comunidade.' },
    ],
  }
}

export function tutorialParticipar(): TutorialSoulie {
  return {
    id: 'participar-comunidade', titulo: 'Participar de um grupo', etapas: [
      { alvo: 'sobre-comunidade', titulo: 'Conheça a comunidade', descricao: 'Confira o nome e o tema para decidir se este grupo combina com você.' },
      { alvo: 'participar-comunidade', titulo: 'Entre quando quiser', descricao: 'Toque em Participar da comunidade para entrar. Depois, o formulário para publicar ficará disponível nesta página.', encerrarAoClicar: true },
    ],
  }
}

export function tutorialDetalheMissao(abrir: () => void, emAndamento: boolean): TutorialSoulie {
  return {
    id: emAndamento ? 'registrar-acao' : 'comecar-missao', titulo: emAndamento ? 'Registrar ação do dia' : 'Começar uma missão', etapas: [
      { alvo: 'resumo-missao', titulo: 'Conheça o desafio', descricao: 'Confira a ação proposta, a meta em dias e os pontos da missão.', preparar: abrir },
      { alvo: 'acao-missao', titulo: emAndamento ? 'Confirme sua ação' : 'Comece sua missão', descricao: emAndamento ? 'Depois de realizar o desafio, use Confirmar ação de hoje. Você pode registrar uma ação por dia; se já confirmou, volte amanhã.' : 'Toque em Começar missão para participar. Depois de realizar a ação, volte ao detalhe para registrar seu progresso.', encerrarAoClicar: true },
    ],
  }
}
