# 🎨 Guia de Design e Especificação de Interface (LunaLink PWA)

Este documento define a identidade visual, os princípios de UX/UI e a especificação detalhada de todas as telas do aplicativo LunaLink. 
Você (Agente IA) deve seguir rigorosamente estas diretrizes ao construir os componentes Angular/Ionic.

---

## 1. Identidade Visual e Tematização (Design System)

O LunaLink deve transmitir profissionalismo, segurança e modernidade, adequados para a gestão de um condomínio de alto padrão.

### 1.1. Paleta de Cores (CSS Variables)
A paleta fornecida é quente e enérgica. Devemos usá-la com sabedoria, contrastando com muito espaço em branco (`#FFFFFF` ou fundos *off-white* como `#F4F5F8`) para não cansar a visão do usuário.

No arquivo `src/theme/variables.scss`, defina as seguintes cores principais (sobrepondo o default do Ionic):

*   **`--ion-color-primary`**: `#bf3b03` (Laranja Escuro/Terra - Cor principal para botões de ação primária, headers e ícones ativos).
*   **`--ion-color-secondary`**: `#ff6a00` (Laranja Vibrante - Usado para destaques, FABs, badges de notificação e elementos de interação secundária).
*   **`--ion-color-tertiary`**: `#ffa748` (Pêssego/Laranja Claro - Excelente para fundos de cards destacados ou ícones de informação).
*   **`--ion-color-success`**: `#ffde7f` (Amarelo Ouro - *Cuidado:* Embora seja da paleta, amarelo puro não é bom para "sucesso". Use-o para status como "Aguardando Retirada" ou "Em Uso". Mantenha um verde padrão, ex: `#2dd36f`, para sucesso real como "Aprovado").
*   **`--ion-color-danger`**: `#820000` (Bordô/Vermelho Escuro - Usado para erros, alertas críticos, status "Cancelado" ou "Rejeitado" e botões destrutivos).
*   **Fundos (Backgrounds)**: Use `--ion-background-color: #F8F9FA` para o fundo geral do app, fazendo com que os `ion-card` brancos (`#FFFFFF`) ganhem destaque com uma leve sombra (`box-shadow`).

### 1.2. Tipografia
*   **Fonte Padrão**: Utilize a família de fontes nativa do sistema (o Ionic já faz isso bem com San Francisco no iOS e Roboto no Android).
*   **Hierarquia**: Use `<h1>` e `<h2>` com peso (font-weight: 600 ou 700) e a cor `--ion-color-primary` para títulos de tela. Textos de corpo devem ser cinza escuro (`#333333` ou `--ion-color-dark`).

### 1.3. Princípios de UX (PWA First)
*   **Navegação Bottom Tabs**: Para moradores, use `ion-tabs` na parte inferior da tela (Início, Reservas, Entregas, Ocorrências).
*   **Feedback Visual (Crucial)**: 
    *   Toda ação (`POST`, `PUT`, `PATCH`, `DELETE`) **DEVE** acionar um `ion-loading` enquanto a requisição ocorre.
    *   Toda resposta de sucesso deve disparar um `ion-toast` verde.
    *   Toda resposta de erro (400, 409, 500) deve disparar um `ion-toast` vermelho (`--ion-color-danger`) exibindo a `message` e os `validationErrors` vindos do backend.
*   **Skeletons**: Ao carregar listas (`GET`), use `ion-skeleton-text` para criar a ilusão de carregamento em vez de uma tela em branco.
*   **Pull to Refresh**: Implemente `ion-refresher` em TODAS as listas para permitir que o usuário atualize os dados manualmente.

---

## 2. Especificação das Telas (Views)

Abaixo estão os detalhes minuciosos de como cada tela deve ser construída.

### 2.1. Autenticação (`/login`)
A porta de entrada do aplicativo. Deve ser minimalista e focada.

*   **Header**: Nenhum.
*   **Layout**: Logo do LunaLink centralizada no topo. Fundo branco ou gradiente muito suave usando a paleta.
*   **Formulário (`ReactiveFormsModule`)**:
    *   `ion-input` para E-mail (type="email").
    *   `ion-input` para Senha (type="password" com ícone de "olho" para revelar/esconder).
*   **Ação**: Botão `ion-button` expand="block" color="primary" escrito "Entrar".
*   **UX**: Validação de e-mail inválido e campos vazios antes de habilitar o botão. Tratamento de erro 400/401 com Toast de "Credenciais inválidas".

### 2.2. Dashboard Principal (Home) - Morador
A primeira tela após o login. Um resumo do condomínio.

*   **Header**: `ion-header` com título "Olá, [Nome do Morador]", e um botão de "Sino" (Notificações) no canto direito com um `ion-badge` laranja (`secondary`) se houver novidades.
*   **Conteúdo**:
    *   **Acesso Rápido**: Uma grid de ícones redondos ou quadrados usando as cores da paleta para: "Nova Reserva", "Reportar Ocorrência".
    *   **Status Rápido**: Dois `ion-card` pequenos no topo:
        *   Card 1: "Encomendas Pendentes" (Mostra o número chamando o GET respectivo). Ícone de caixa.
        *   Card 2: "Minhas Reservas Ativas" (Mostra a próxima reserva confirmada).
*   **UX**: Se o usuário for Admin, a Home deve ser diferente, focada em métricas (ex: Reservas a aprovar hoje, Ocorrências abertas).

### 2.3. Módulo: Espaços e Reservas (`/reservations`)
Onde o morador agenda Salão de Festas ou Churrasqueira.

#### Lista de Reservas (`/reservations/list`)
*   **Layout**: `ion-list` exibindo as reservas do morador.
*   **Item (`ion-item`)**: 
    *   Data em destaque (ex: 15 Mai).
    *   Nome do espaço (`spaceType` formatado, ex: "Salão de Festas").
    *   `ion-chip` indicando o status: `PENDING` (Amarelo/Tertiary), `APPROVED` (Verde), `REJECTED` (Bordô/Danger).
*   **Ação Principal**: Um `ion-fab` (botão flutuante) no canto inferior direito, cor `--ion-color-secondary`, com o ícone de `+` para nova reserva.

#### Criar Reserva (`/reservations/new`)
*   **Layout**: Formulário simples.
*   **Campos**:
    *   `ion-select` para o Espaço (`spaceId`).
    *   `ion-datetime` apresentado como um modal ou calendário inline para escolher a data (`date`).
*   **Ação**: Botão "Solicitar Reserva" (Chama o POST).
*   **UX**: Ao selecionar a data, seria ideal chamar o endpoint `GET /availabilitySpaces/.../status` para mostrar ao usuário se aquele dia está livre ANTES dele clicar em Salvar. Se estiver ocupado, mostre um texto vermelho e desabilite o botão.

### 2.4. Módulo: Empréstimo de Equipamentos (TV Comunitária)
Onde a portaria controla a retirada e o morador agenda.

#### Agendamento (Morador) (`/equipment/new`)
*   **Layout**: Formulário.
*   **Campos**: 
    *   Data (`date` via `ion-datetime`).
    *   Hora Início (`startTime` via `ion-datetime` presentation="time").
    *   Hora Fim (`endTime` via `ion-datetime` presentation="time").
*   **UX**: Validação reativa rigorosa garantindo que `endTime` > `startTime`. Tratamento específico para o erro 409 (Conflito), exibindo um Alerta: "Este equipamento já está reservado neste horário."

#### Gestão de Retirada/Devolução (Apenas Admin/Porteiro) (`/equipment/manage`)
*   **Layout**: Uma lista das reservas **de hoje** (usando o GET com filtro `date=HOJE`).
*   **Item (`ion-card`)**:
    *   Exibe o `equipmentName`, `userName`, e `userApartment` em destaque (ex: "TV - João (Ap 101)").
    *   Exibe o horário (ex: "14:00 às 16:00").
*   **Fluxo de Ações (Botões dentro do Card)**:
    *   Se status `CONFIRMED`: Mostra botão "Entregar Equipamento" (Chama PATCH `/handover`). Cor: Primary.
    *   Se status `IN_USE`: Mostra botão "Receber Devolução" (Chama PATCH `/return`). Cor: Secondary.
    *   Se status `RETURNED`: Card fica acinzentado, sem botões.

### 2.5. Módulo: Entregas (Delivery)
O controle do fluxo de pacotes na portaria.

#### Registro de Nova Entrega (Apenas Admin/Porteiro) (`/delivery/new`)
*   **Campos**:
    *   `ion-select` pesquisável para escolher o Morador. *Importante:* Use o `GET /users/summary` para preencher esta lista, mostrando "Nome - Ap X".
    *   `ion-input` para Código de Rastreio (`protocolNumber` - Opcional).
    *   `ion-input` para Descrição (`discrimination` - Opcional, ex: "Caixa Amazon").
*   **Ação**: Botão "Registrar Chegada".
*   **UX Web Push**: Assim que o POST retornar 200, exiba um Toast: "Entrega registrada. O morador foi notificado."

#### Lista de Entregas Pendentes (Porteiro)
*   **Layout**: Lista mostrando pacotes aguardando retirada (Status `PENDING`).
*   **Ação no Item**: Botão ou Swipe para "Confirmar Retirada" (Chama PATCH `/confirm-receipt`). 
*   **UX**: Ao clicar em confirmar, abra um `ion-alert` simples perguntando: "Quem está retirando?" (Input para preencher o `pickedUpBy`). Se deixado em branco, envia nulo.

#### Minhas Entregas (Morador)
*   Apenas visualização em formato de linha do tempo ou cards, mostrando o histórico do que chegou e quando foi retirado (`deliveredAt`).

### 2.6. Módulo: Ocorrências (Livro Negro)
Para formalizar reclamações.

#### Nova Ocorrência (Morador) (`/occurrences/new`)
*   **Layout**: Focado na escrita.
*   **Campos**:
    *   `ion-datetime` para `incidentDate` (Data e Hora do fato). *Restrição:* Max value = Agora (não permite datas futuras).
    *   `ion-textarea` grande (rows="6") para a `description` detalhada.
*   **Ação**: Botão "Registrar Ocorrência".
*   **UX**: Deixe claro via texto na tela que esta ação é irreversível e será notificada ao síndico.

---

## 3. A Peça Central: Web Push Notifications (Service Worker)

Para que o PWA faça sentido, a experiência de opt-in de notificação deve ser elegante.

*   **Ação de Opt-in**: Logo após o primeiro login bem-sucedido, o app deve checar se a permissão de notificação já foi concedida (`Notification.permission`).
*   **UX (Prompt Customizado)**: Se não foi concedida, NÃO dispare a requisição padrão do navegador do nada. Mostre um `ion-modal` ou `ion-card` estilizado com a cor `--ion-color-secondary` dizendo: 
    *   *"Fique por dentro! Deseja ser avisado instantaneamente quando sua encomenda chegar ou sua reserva for aprovada?"*
    *   Botões: "Sim, ativar" / "Agora não".
*   **Fluxo Técnico**: Se o usuário clicar em "Sim", chame o `WebPushService` que criamos, solicite a permissão ao sistema, obtenha a Inscrição (Subscription) via `SwPush`, e envie silenciosamente o POST para `/lunaLink/push/subscribe`.

---
**Fim das Diretrizes de Design.** 
Agente IA, confirme o recebimento deste guia e inicie a construção das Views (após a conclusão da infraestrutura de Dados e Services) baseando-se estritamente nos padrões acima.