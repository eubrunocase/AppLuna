# Contexto de Negócio: LunaLink (Sistema de Gestão de Condomínios)

## Visão Geral dos Papéis de Usuário (Roles)
O sistema trabalha com três tipos principais de usuários. Entender essas diferenças é fundamental para a correta exibição de menus, rotas e botões na interface.

### 1. ADMIN_ROLE (Síndico / Administrador)
Possui controle total e capacidade de gerenciar os usuários e aprovações do condomínio.
- **Gestão de Usuários:** Único perfil que pode criar, editar ou excluir outros usuários (Moradores e Funcionários).
- **Gestão de Espaços:** Pode criar novos espaços no sistema.
- **Reservas de Espaços:** Tem a capacidade de aprovar (`/approve`), rejeitar (`/reject`) ou excluir reservas feitas por moradores. Também é o único que acessa a área de geração de relatórios de reserva.
- **Equipamentos:** Pode listar, gerenciar e realizar check-in/check-out de reservas de equipamentos do condomínio.
- **Telas Exclusivas no Front-end:** Dashboard administrativo, Painel de Aprovações, Gestão de Usuários, Painel de Relatórios.

### 2. RESIDENT_ROLE (Morador)
É o usuário final comum. O front-end deste usuário deve focar em self-service e visualização de suas próprias demandas.
- **Consultas:** Pode visualizar disponibilidade de espaços, checar status das próprias reservas e consultar informações gerais do seu perfil.
- **Ações:** Pode solicitar novas reservas de espaços e fazer reservas de equipamentos (cria a intenção de reserva, mas o check-in do equipamento é feito por um administrador/funcionário).
- **Ocorrências:** Pode abrir novas ocorrências (ex: barulho, manutenção), bem como visualizar, editar e excluir as **próprias** ocorrências.
- **Encomendas:** Pode visualizar as entregas e encomendas registradas para a sua unidade.
- **Telas Exclusivas no Front-end:** Painel do Morador, Minhas Reservas, Minhas Ocorrências, Minhas Encomendas. Não deve ver opções de "Aprovar" ou "Criar novo Usuário".

### 3. EMPLOYEE (Funcionário / Porteiro)
Perfil operacional. Seu objetivo é ajudar no fluxo do dia a dia do condomínio (ex: controle de portaria e entregas).
- **O que faz no sistema (Regra de Negócio Padrão):** O funcionário não gerencia o sistema (não cria regras nem usuários), mas deveria registrar chegadas de encomendas (`/delivery`) e gerenciar o fluxo físico de empréstimo de equipamentos (check-in/check-out).
- **Atenção para o Agente de Front-end / Back-end:** Atualmente na API (`SecurityConfiguration`), as permissões de check-in/check-out de equipamento (`PATCH /lunaLink/equipment-reservation/**`) estão restritas **apenas para ADMIN_ROLE**, apesar do comentário do código prever a participação do funcionário. 
- **Telas Exclusivas no Front-end:** Painel da Portaria, Registro de Encomendas, Entrega de Equipamentos. O Front-end deve tratar o `EMPLOYEE` como uma versão de visualização rápida para o dia a dia, bloqueando menus gerenciais (relatórios, aprovações de festas, etc.).

## Considerações para a Criação de Telas (Front-End)
- **Roteamento Privado:** Crie componentes de `ProtectedRoute` ou `RoleRoute` que validem o token JWT e escondam menus administrativos se o usuário logado for `RESIDENT_ROLE` ou `EMPLOYEE`.
- **Tratamento de Erros:** Como os acessos são estritamente separados pela API, caso o front-end tente acessar uma rota não permitida para o perfil (ex: Morador tentando aprovar reserva), a API retornará `403 Forbidden`. O Front-end deve estar preparado para capturar esse status e exibir um aviso amigável de "Acesso Negado".



## Mapa de Integração com a API (Endpoints por Funcionalidade e Perfil)
O Front-End deve consumir a API REST cujos recursos estão mapeados sob o prefixo principal (ex: `http://localhost:8080`). Todas as requisições (exceto login) exigem o envio do token JWT no header: `Authorization: Bearer <token>`.

### 1. Autenticação (Público)
*Base URL: `/lunaLink/auth`*
- `POST /login`: Endpoint público para login. Recebe as credenciais e retorna o token JWT.
- `GET /swagger-ui.html` e `/v3/api-docs`: Consulta da documentação interativa (Swagger).

### 2. Gestão de Usuários e Perfil
*Base URL: `/lunaLink/users`*
- **Moradores, Funcionários e Admin (Authenticated):**
  - `GET /` e `GET /{id}`: Busca dados dos usuários. Útil para consultar o próprio perfil.
  - `GET /summary`: Retorna um resumo dos dados do usuário logado.
- **Exclusivo para `ADMIN_ROLE`:**
  - `POST /create`: Criação de novos usuários (Moradores, Funcionários ou outros Admins).
  - `PUT /update/{id}`: Edição de usuários.
  - `DELETE /delete/{id}`: Exclusão de usuários.

### 3. Reservas de Espaços
*Base URL: `/lunaLink/reservation`*
- **Moradores e Admin (Authenticated):**
  - `GET /`: Lista as reservas do usuário logado (ou todas, dependendo da permissão interna da API).
  - `GET /{id}`: Detalhes de uma reserva específica.
  - `GET /checkAvaliability/{date}/{spaceId}`: Consulta disponibilidade de um espaço para um dia específico.
  - `POST /`: Solicita uma nova reserva de espaço.
  - `PUT /{id}`: Edita detalhes da própria reserva.
- **Exclusivo para `ADMIN_ROLE`:**
  - `PUT /{id}/approve`: Aprova a reserva solicitada por um morador.
  - `PUT /{id}/reject`: Rejeita a reserva solicitada por um morador.
  - `DELETE /{id}`: Cancela/deleta forçadamente uma reserva.
  - `GET /report/monthly`: Rota para popular os gráficos do dashboard do síndico.

### 4. Gestão de Espaços Comuns (Visualização)
*Base URL: `/lunaLink/space`*
- **Todos (Authenticated):**
  - `GET /`: Lista todos os espaços disponíveis no condomínio (ex: Salão de Festas, Churrasqueira) para popular os selects do formulário de reserva.

### 5. Disponibilidade e Calendário de Espaços
*Base URL: `/lunaLink/availabilitySpaces/{spaceId}/availability`*
- **Todos (Authenticated):**
  - `GET /status`: Retorna o status geral de disponibilidade.
  - `GET /month/{year}/{month}`: Traz a disponibilidade em formato de calendário para um mês específico.
  - `GET /stats/{year}/{month}`: Estatísticas de uso do espaço no mês.
  - `POST /period`: Busca disponibilidade dentro de um período específico.

### 6. Reservas de Equipamentos (Check-in/Check-out)
*Base URL: `/lunaLink/equipment-reservation`*
- **Moradores e Admin (Authenticated):**
  - `POST /`: Morador cria a intenção de reserva de um equipamento (ex: furadeira, carrinho de compras).
- **Exclusivo para `ADMIN_ROLE`:** *(Atenção: A regra deveria incluir `EMPLOYEE`, mas a API está restrita a `ADMIN_ROLE` no back-end atualmente)*
  - `GET /`: Lista todas as reservas de equipamentos (painel da portaria/administração).
  - `PATCH /{id}/handover`: Realiza o check-out (entrega do equipamento ao morador).
  - `PATCH /{id}/return`: Realiza o check-in (devolução do equipamento).

### 7. Gestão de Encomendas
*Base URL: `/lunaLink/delivery`*
- **Todos (Authenticated):**
  - `POST /create`: Registra a chegada de uma nova encomenda (Tela da Portaria).
  - `GET /findAll`: Lista encomendas (morador vê as suas; funcionário/admin vê de todos).
  - `GET /find/{id}`: Detalhes de uma encomenda.
  - `PUT /update/{id}`: Edita dados da encomenda.
  - `PUT /{id}/confirm-receipt`: Morador ou porteiro confirma que a encomenda foi retirada.

### 8. Gestão de Ocorrências (Livro Negro/Reclamações)
*Base URL: `/lunaLink/occurrences`*
- **Todos (Authenticated):**
  - `POST /create`: Abre uma nova ocorrência.
  - `GET /findAll`: Lista as ocorrências (Morador vê as dele, Admin vê todas).
  - `GET /find/{uuid}`: Detalhes de uma ocorrência.
  - `DELETE /delete/{uuid}`: Exclui uma ocorrência.
  - `PUT /{uuid}`: Edita/Atualiza uma ocorrência (ex: mudar status).

### 9. Notificações Push (Web Push)
*Base URL: `/lunaLink/push`*
- **Todos (Authenticated):**
  - `GET /public-key`: Busca a chave VAPID pública para registrar o Service Worker no front-end.
  - `POST /subscribe`: Inscreve o navegador do usuário para receber notificações.
  - `POST /unsubscribe`: Remove a inscrição do dispositivo.

---
**Dica para a IA de Front-End na criação dos Services (Axios/Fetch):**
Ao criar a camada de integração (`api.js` ou serviços dedicados como `ReservationService.js`), organize os arquivos espelhando esses módulos de endpoints e mapeie os possíveis erros `403 Forbidden` nos interceptadores (interceptors) globais para redirecionar o usuário ou exibir um Toast de "Acesso Negado", visto que a proteção das rotas por perfil de usuário (`ADMIN_ROLE`) é fortemente validada no servidor (`SecurityFilterChain`).