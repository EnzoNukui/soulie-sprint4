# Soulie | Front-end Design Engineering — Sprint 4

<p align="center">
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&amp;logo=react&amp;logoColor=61DAFB" alt="React">
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&amp;logo=vite&amp;logoColor=white" alt="Vite">
  <img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&amp;logo=typescript&amp;logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&amp;logo=tailwindcss&amp;logoColor=white" alt="Tailwind CSS">
  <br>
  <img src="https://img.shields.io/badge/React_Router-CA4245?style=for-the-badge&amp;logo=reactrouter&amp;logoColor=white" alt="React Router">
  <img src="https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&amp;logo=reacthookform&amp;logoColor=white" alt="React Hook Form">
  <img src="https://img.shields.io/badge/Lucide-111827?style=for-the-badge&amp;logo=lucide&amp;logoColor=white" alt="Lucide">
  <img src="https://img.shields.io/badge/API_Java-ED8B00?style=for-the-badge&amp;logo=openjdk&amp;logoColor=white" alt="API Java">
  <img src="https://img.shields.io/badge/Vercel-000000?style=for-the-badge&amp;logo=vercel&amp;logoColor=white" alt="Vercel">
</p>

A **Soulie** é uma companheira digital da SoulUp que transforma ações sustentáveis em uma jornada com missões, progresso e comunidades. O projeto busca incentivar a continuidade dos hábitos e aproximar as pessoas da proposta da plataforma.

Nesta Sprint 4, o site e o aplicativo formam uma **SPA em React, Vite e TypeScript**. O aplicativo consome a **API REST desenvolvida em Java pelo grupo** para consultar e registrar dados reais. A interface usa Tailwind CSS e se adapta a celular, tablet e desktop.

## Como usar

### Links da entrega

| Recurso | Endereço |
| --- | --- |
| Repositório do front-end | [EnzoNukui/soulie-sprint4](https://github.com/EnzoNukui/soulie-sprint4) |
| Aplicação publicada na Vercel | [soulie-sprint4.vercel.app](https://soulie-sprint4.vercel.app/) |
| API Java publicada | [soulie-java.onrender.com/missoes](https://soulie-java.onrender.com/missoes) |
| Vídeo de apresentação | [Assistir no YouTube](https://youtu.be/nqB3IUTKXAY?si=EOsZCH2BwNNibNlt) |

A URL base utilizada pelo front-end para a API é **https://soulie-java.onrender.com**.

### Navegação pelo projeto

1. Abra a [página inicial](https://soulie-sprint4.vercel.app/) para conhecer a proposta da Soulie, a equipe e as páginas informativas.
2. Acesse [Entrar](https://soulie-sprint4.vercel.app/app/acesso) com um e-mail já cadastrado ou escolha [Cadastrar](https://soulie-sprint4.vercel.app/app/cadastro) para criar uma jornada informando nome e e-mail. A jornada é recuperada nas visitas seguintes pelo identificador salvo no navegador.
3. No aplicativo, acompanhe o resumo da jornada em **Início**, explore e crie **Missões**, registre ações do dia e participe de **Comunidades**. O espaço de publicações permite compartilhar, editar e excluir as próprias mensagens.
4. Para dúvidas ou sugestões, use o [formulário de contato](https://soulie-sprint4.vercel.app/contato). Seu envio usa EmailJS, configurado separadamente da API Java.

## Funcionalidades

- **Site público:** Home, Sobre, Solução, Integrantes, FAQ e Contato, com navegação sem recarregamento completo.
- **Páginas da solução:** o conteúdo de Solução explica a proposta; o aplicativo permite percorrer uma jornada funcional de missões e comunidades.
- **Acesso à jornada:** telas separadas para entrar com e-mail existente e cadastrar novo usuário pela API Java, com recuperação da sessão e opção de sair.
- **Missões:** listagem, detalhes, criação, participação e registro de atividades, com acompanhamento do progresso.
- **Comunidades:** listagem, pesquisa, detalhes, criação e participação ou saída.
- **Publicações:** feed com dados da API, criação, edição e exclusão pelo autor.
- **Contato:** formulário validado com envio por e-mail e retorno de sucesso ou erro.
- **Estados de interface:** mensagens de carregamento, erro e ausência de dados nas consultas relevantes.
- **Tutoriais da Soulie:** orientações passo a passo para criar comunidades e missões, participar de grupos, publicar e registrar ações. A Soulie acompanha o campo destacado com exemplos e controles para avançar, voltar ou sair. O usuário preenche e confirma cada envio.

### Da Sprint 3 para a Sprint 4

| Base construída na Sprint 3 | Evolução nesta entrega |
| --- | --- |
| Site institucional em SPA, com páginas públicas e perfis por RM | Aplicativo integrado ao site, com início, missões e comunidades |
| Formulário de contato com validação local | Envio real de mensagens por e-mail, com resposta de sucesso ou erro |
| Demonstração visual da solução | Leitura e escrita de dados reais pela API Java publicada |
| Layout responsivo com Tailwind CSS | Navegação própria do aplicativo, estados de carregamento, erro e lista vazia |

### Rotas principais

| Caminho | Página |
| --- | --- |
| `/`, `/sobre`, `/solucao`, `/faq`, `/contato` | Páginas públicas do site |
| `/integrantes` e `/integrantes/:rm` | Equipe e perfil individual por RM |
| `/app/acesso` | Entrada de usuário já cadastrado |
| `/app/cadastro` | Cadastro de nova jornada |
| `/app` | Resumo da jornada |
| `/app/missoes` | Missões e atividades |
| `/app/comunidades` e `/app/comunidades/:id` | Comunidades e seus detalhes |

As rotas do aplicativo redirecionam para `/app/acesso` quando não há jornada recuperável. Identificadores inválidos recebem tratamento na interface.

O fluxo de entrada consulta o e-mail cadastrado e o cadastro cria o usuário em uma ação separada. A API atual não oferece senha; portanto, a identificação por e-mail não constitui autenticação de segurança.

## Integração com a API Java

O cliente HTTP em `my-app/src/services/apiClient.ts` usa **fetch**, adiciona os cabeçalhos necessários e centraliza o tratamento de falhas. As operações ficam em arquivos de `src/services/`, enquanto os contratos de dados são tipados em `src/types/api.ts`.

| Operação exigida | Exemplo implementado | Uso na interface |
| --- | --- | --- |
| Leitura de lista | `GET /missoes`, `GET /comunidades`, `GET /postagens` | Missões, comunidades e feed |
| Leitura de detalhe | `GET /missoes/:id`, `GET /comunidades/:id` | Detalhes da missão e da comunidade |
| Escrita | `POST /usuarios`, `POST /atividades`, `POST /postagens` | Cadastro, registro de ação e publicação |
| Atualização e exclusão | `PUT /postagens/:id`, `DELETE /postagens/:id` | Edição e remoção de publicações |

Também há operações de participação em missões e comunidades. O aplicativo apresenta estados de carregamento, erro e lista vazia, com opção de tentar novamente em consultas que falham. O **EmailJS atende apenas ao formulário de contato**; a integração avaliada com o backend e o banco de dados ocorre pela API Java.

Para lidar com a inicialização lenta da API hospedada no Render, cada requisição tem um **tempo limite de 60 segundos**. Se a API não responder nesse prazo, a interface mostra uma mensagem amigável e o usuário pode tentar novamente.

### Desempenho

As páginas são carregadas **sob demanda** com a opção `lazy` do React Router: apenas a Home faz parte do pacote inicial, e as demais rotas são baixadas quando acessadas. Com isso, o JavaScript inicial caiu de cerca de 498 kB para 308 kB (antes da compressão).

## Tecnologias utilizadas

| Tecnologia | Uso no projeto |
| --- | --- |
| React + Vite | Componentes e compilação da SPA |
| TypeScript | Interfaces, tipos de domínio e validação do código |
| React Router DOM | Rotas estáticas, rotas dinâmicas e navegação |
| Tailwind CSS | Estilização e responsividade |
| React Hook Form | Controle e validação do formulário de contato |
| Fetch API | Requisições HTTP à API Java e ao EmailJS |
| Lucide React | Ícones da interface |
| Vercel | Publicação do front-end |
| API Java | Dados persistidos e operações da jornada |
| EmailJS | Encaminhamento das mensagens de contato por e-mail |

## Estrutura de pastas

```text
soulie-sprint4/
├── README.md
└── my-app/
    ├── .env.example            # nomes das variáveis de ambiente
    ├── public/                 # arquivos estáticos
    ├── src/
    │   ├── assets/            # imagens, avatares e vídeo
    │   ├── components/        # interface reutilizável
    │   ├── routes/            # páginas e configuração de rotas
    │   ├── services/          # comunicação com API Java e EmailJS
    │   ├── types/             # contratos TypeScript
    │   ├── App.tsx
    │   ├── globals.css
    │   └── main.tsx
    ├── index.html
    ├── package.json
    ├── package-lock.json
    ├── tsconfig.json
    ├── vercel.json
    └── vite.config.ts
```

### Executar localmente

É necessário ter Node.js e npm instalados. A API Java precisa estar acessível para usar as funções do aplicativo.

```bash
git clone https://github.com/EnzoNukui/soulie-sprint4.git
cd soulie-sprint4/my-app
npm ci
cp .env.example .env
npm run dev
```

No arquivo `.env`, defina `VITE_API_URL=https://soulie-java.onrender.com`. Para que o formulário de contato envie mensagens, preencha também `VITE_EMAILJS_SERVICE_ID`, `VITE_EMAILJS_TEMPLATE_ID` e `VITE_EMAILJS_PUBLIC_KEY` com os valores da conta EmailJS do projeto. O arquivo `.env` é ignorado pelo Git e não deve ser incluído nos commits. Reinicie o servidor Vite após mudar essas variáveis.

O endereço local aparecerá no terminal. Para conferir o projeto antes de publicar:

```bash
npm run lint
npm run build
npm run preview
```

### Publicação na Vercel

O diretório da aplicação é `my-app`. Na configuração do projeto na Vercel, use esse diretório como raiz, `npm run build` para compilar e `dist` como saída. Cadastre `VITE_API_URL` e, para habilitar o contato, as três variáveis `VITE_EMAILJS_...` em **Settings → Environment Variables**. Uma mudança nessas variáveis exige uma nova implantação. O arquivo `vercel.json` encaminha as rotas da SPA para `index.html`, permitindo abrir diretamente URLs como `/app/missoes`.

## Responsividade e acessibilidade

A interface mantém a identidade visual da Soulie entre páginas, cards, botões, cabeçalho e rodapé. As classes responsivas do Tailwind CSS reorganizam o conteúdo e ajustam espaçamentos, fontes e imagens em celular, tablet e desktop. O aplicativo mostra menu lateral em telas amplas e navegação inferior em telas menores.

Formulários têm rótulos, mensagens de validação e destaque visual de campos inválidos; menus e controles incluem estados de foco para navegação por teclado.

## Autores e créditos

| Integrante | Foto | RM | Turma | LinkedIn | GitHub |
| --- | --- | --- | --- | --- | --- |
| Arthur Carvalho Brito Martins | <img src="./my-app/src/assets/integrantes/foto_arthur.jpeg" alt="Arthur Carvalho Brito Martins" width="56"> | 572325 | 1TDSPH | [Perfil](https://www.linkedin.com/in/arthur-martinss/) | [arthurmartinss](https://github.com/arthurmartinss) |
| Diego Soares Trujillo | <img src="./my-app/src/assets/integrantes/foto_diego.jpg" alt="Diego Soares Trujillo" width="56"> | 570147 | 1TDSPH | [Perfil](https://www.linkedin.com/in/diego-trujillo-3441b9380/) | [diegotrujillo011](https://github.com/diegotrujillo011) |
| Enzo Nukui da Silva | <img src="./my-app/src/assets/integrantes/foto_enzo.jpeg" alt="Enzo Nukui da Silva" width="56"> | 569770 | 1TDSPH | [Perfil](https://www.linkedin.com/in/enzo-nukui/) | [EnzoNukui](https://github.com/EnzoNukui) |
| Leticia Cardoso de Almeida | <img src="./my-app/src/assets/integrantes/foto_leticia_cardoso.jpeg" alt="Leticia Cardoso de Almeida" width="56"> | 569415 | 1TDSPH | [Perfil](https://www.linkedin.com/in/let%C3%ADcia-almeida-70b851294/) | [lehalmeidafc0](https://github.com/lehalmeidafc0) |
| Leticia Dias Araujo Felix Moratori | <img src="./my-app/src/assets/integrantes/foto_leticia_dias.jpeg" alt="Leticia Dias Araujo Felix Moratori" width="56"> | 569138 | 1TDSPH | [Perfil](https://www.linkedin.com/in/leticia-felix-660253286) | [LeticiaFelix18](https://github.com/LeticiaFelix18) |

Projeto acadêmico desenvolvido para o **Challenge FIAP 2026**, em parceria com a **SoulUp**.

## Imagens e ícones do projeto

A Soulie possui diferentes expressões para comunicar o estado da jornada. A aplicação também utiliza fotografias da equipe, imagens das comunidades, ícones da biblioteca Lucide React e uma animação em vídeo na Home.

| Expressão | Imagem | Aplicação |
| --- | --- | --- |
| Feliz | <img src="./my-app/src/assets/avatar/expressoes/avatar_feliz.png" alt="Soulie feliz" width="60"> | Conclusão de missões |
| Radiante | <img src="./my-app/src/assets/avatar/expressoes/avatar_radiante.png" alt="Soulie radiante" width="60"> | Marcos de progresso e recorrência |
| Sorridente | <img src="./my-app/src/assets/avatar/expressoes/avatar_sorridente.png" alt="Soulie sorridente" width="60"> | Evolução positiva na jornada |
| Bravo | <img src="./my-app/src/assets/avatar/expressoes/avatar_bravo.png" alt="Soulie brava" width="60"> | Interrupção de sequência ou alerta |
| Triste | <img src="./my-app/src/assets/avatar/expressoes/avatar_triste.png" alt="Soulie triste" width="60"> | Longos períodos de inatividade |
| Entediado | <img src="./my-app/src/assets/avatar/expressoes/avatar_entediado.png" alt="Soulie entediada" width="60"> | Inatividade moderada |
| Tímido | <img src="./my-app/src/assets/avatar/expressoes/avatar_timido.png" alt="Soulie tímida" width="60"> | Onboarding e primeiras interações |
| Com dúvida | <img src="./my-app/src/assets/avatar/expressoes/avatar_duvida.png" alt="Soulie com dúvida" width="60"> | Ajuda e orientação |
| Com pressa | <img src="./my-app/src/assets/avatar/expressoes/avatar_com_pressa.png" alt="Soulie com pressa" width="60"> | Lembretes e urgência |

### Páginas do site: antes e depois

As comparações visuais produzidas na Sprint 3 continuam mostrando a evolução do site público. Na Sprint 4, essa base visual foi preservada e o projeto ganhou o aplicativo integrado à API Java e o envio real do formulário de contato.

#### Home

A página inicial apresenta a Soulie, os pilares da solução e as chamadas para conhecer o projeto.

| Antes | Depois |
| :---: | :---: |
| <img src="./my-app/src/assets/produto/home-antigo.png" alt="Versão anterior da Home" width="100%"> | <img src="./my-app/src/assets/produto/home-novo.png" alt="Versão atual da Home" width="100%"> |

#### Sobre

A página Sobre apresenta a origem da Soulie, suas expressões e a trajetória de acompanhamento.

| Antes | Depois |
| :---: | :---: |
| <img src="./my-app/src/assets/produto/sobre-antigo.png" alt="Versão anterior da página Sobre" width="100%"> | <img src="./my-app/src/assets/produto/sobre-novo.png" alt="Versão atual da página Sobre" width="100%"> |

#### Solução

A página Solução explica como missões, pontos, comunidades e recompensas transformam sustentabilidade em hábito.

| Antes | Depois |
| :---: | :---: |
| <img src="./my-app/src/assets/produto/solucao-antigo.png" alt="Versão anterior da página Solução" width="100%"> | <img src="./my-app/src/assets/produto/solucao-novo.png" alt="Versão atual da página Solução" width="100%"> |

#### Integrantes

A página Integrantes apresenta a equipe e permite acessar perfis individuais pela rota com RM.

| Antes | Depois |
| :---: | :---: |
| <img src="./my-app/src/assets/produto/integrantes-antigo.png" alt="Versão anterior da página Integrantes" width="100%"> | <img src="./my-app/src/assets/produto/integrantes-novo.png" alt="Versão atual da página Integrantes" width="100%"> |

#### FAQ

A página FAQ reúne as principais dúvidas em perguntas expansíveis.

| Antes | Depois |
| :---: | :---: |
| <img src="./my-app/src/assets/produto/faq-antigo.png" alt="Versão anterior da página FAQ" width="100%"> | <img src="./my-app/src/assets/produto/faq-novo.png" alt="Versão atual da página FAQ" width="100%"> |

#### Contato

A página Contato oferece um formulário para dúvidas, problemas técnicos, sugestões e feedbacks. Na Sprint 4, o envio passou a chegar por e-mail à equipe.

| Antes | Depois |
| :---: | :---: |
| <img src="./my-app/src/assets/produto/contato-antigo.png" alt="Versão anterior da página Contato" width="100%"> | <img src="./my-app/src/assets/produto/contato-novo.png" alt="Versão atual da página Contato" width="100%"> |

## Contato

Envie dúvidas, sugestões e relatos pelo [formulário de contato da Soulie](https://soulie-sprint4.vercel.app/contato). Para questões sobre o código, use as [Issues do repositório](https://github.com/EnzoNukui/soulie-sprint4/issues).


## Licença

Projeto desenvolvido para fins acadêmicos. O uso dos materiais deve preservar os créditos dos autores e respeitar as marcas da SoulUp e da FIAP.
