# 🔄 Plano de Refatoração e Reconstrução do Frontend (LunaLink PWA)

Este documento define as diretrizes, o contexto arquitetural e o plano de ação para a reconstrução total do frontend do LunaLink. 

**LEIA COM ATENÇÃO:** Nossa arquitetura mudou drasticamente. As instruções abaixo são absolutas e devem guiar todo o desenvolvimento a partir de agora.

---

## 🚨 1. Decisão Arquitetural: O "Grande Reset"

O nosso backend (Spring Boot 3.2.x) passou por uma refatoração profunda. A modelagem de dados, os contratos da API (DTOs) e as regras de negócio amadureceram. Além disso, tomamos uma decisão estratégica em relação ao client:

1. **Abandono do Mobile Nativo:** Não usaremos mais Capacitor/Cordova para gerar builds nativos para iOS ou Android.
2. **Foco 100% em PWA:** O projeto será exclusivamente um Progressive Web App (PWA).
3. **Descarte da Estrutura Atual:** Como o frontend atual está em uma fase muito inicial e totalmente defasado em relação ao novo backend, **a abordagem será descartar TODA a estrutura atual (services, models, views, components) e recomeçar do ZERO dentro deste mesmo repositório.**

A partir deste momento, considere a base de código antiga como obsoleta. Vamos recriar a fundação do projeto de forma limpa, tipada e alinhada à nova API.

---

## 🏗️ 2. O Novo Paradigma Tecnológico (Angular + Ionic PWA)

Ao reconstruir o projeto, as seguintes tecnologias e abordagens devem ser utilizadas:

- **Frameworks:** Angular 17+ e Ionic Framework.
- **PWA First:** Integração do `@angular/pwa` para suporte offline, manifest e, principalmente, Service Workers.
- **Web Push Notifications:** **NÃO utilizaremos Firebase.** O backend foi configurado para usar o padrão nativo **VAPID**. A inscrição deve ser feita usando a classe `SwPush` do Angular, e as chaves (`p256dh`, `auth`, `endpoint`) devem ser enviadas ao nosso backend.
- **Tipagem Estrita:** Uso rigoroso de TypeScript. Interfaces DTO exatas devem ser criadas para espelhar o backend(use o arquivo API.MD na raiz do projeto para contexto da arquitetura e contratos da API backend). **Zero uso de `any`**.
- **RxJS e Reatividade:** Serviços HTTP devem retornar `Observable` fortemente tipados. Gerenciamento de estado e tratamento de erros devem ser reativos.

---

## 🧩 3. Resumo dos Novos Domínios do Backend(completo no API.MD)

O novo backend possui os seguintes domínios, que ditarão a criação das interfaces e serviços no Angular:

### 3.1. Autenticação e Usuários
- A entidade abstrata `Resident` sumiu. Agora temos apenas **`Users`**.
- O login agora é feito por **`email`** (não mais por `login`).
- Endpoint de Login: `POST /lunaLink/auth/login` -> Retorna JWT.
- Novo endpoint otimizado para selects: `GET /lunaLink/users/summary` (Traz apenas ID, Nome, Apartamento e Email).

### 3.2. Entregas (Delivery)
- Entidade unificada. Não existe mais `DeliveryReceived`.
- A criação de entrega possui campos opcionais (`protocolNumber`, `discrimination`).
- Novo fluxo de baixa: O porteiro confirma a entrega via `PATCH /lunaLink/delivery/{id}/confirm-receipt?pickedUpBy=Nome`, mudando o status para `DELIVERED`.

### 3.3. Reservas de Espaços (Reservation)
- Continua com granularidade de **diárias**.
- Novo endpoint de faturamento/relatório exclusivo para administradores: `GET /lunaLink/reservation/report/monthly?month=X&year=YYYY`.

### 3.4. Empréstimo de Equipamentos (NOVO)
- Exemplo: TV Comunitária.
- Diferente dos espaços, possui **granularidade por hora** (`startTime` e `endTime`).
- O backend faz validação estrita de conflito de horário (retorna `409 Conflict`).
- Fluxo de status rígido controlado pela portaria: `CONFIRMED` -> `PATCH .../handover` -> `IN_USE` -> `PATCH .../return` -> `RETURNED`.

### 3.5. Ocorrências / Livro Negro (NOVO)
- Registro digital de queixas pelos moradores.
- Validação estrita: A data do incidente não pode ser no futuro.
- Envia notificações em tempo real para os síndicos.

### 3.6. Tratamento de Erros e Validação
- O backend agora possui um `GlobalExceptionHandler`.
- Erros de validação (`@Valid` no backend) retornarão HTTP 400 com um `ValidationErrorDTO` contendo um mapa de `validationErrors` (ex: `{"description": "A descrição não pode ser vazia"}`).
- O frontend deve interceptar esses erros e exibi-los corretamente nos formulários reativos.

---

## 🛠️ 4. Instruções de Execução para o Agente de IA

Para iniciarmos esta reconstrução, execute as tarefas na seguinte ordem, aguardando aprovação entre as etapas:

**Fase 1: Preparação PWA e Limpeza**
1. Forneça os comandos para instalar as dependências de PWA no projeto Angular/Ionic existente (`@angular/pwa`).
2. Oriente sobre quais pastas e arquivos antigos devemos deletar para limpar o projeto (ex: apagar conteúdo de `src/app/core`, apagar antigas páginas).

**Fase 2: Fundação de Dados (Models)**
3. Solicite o documento de Schema do Backend (se ainda não fornecido) e crie a estrutura de pastas recomendada (ex: `src/app/core/models/`).
4. Gere **TODAS as interfaces TypeScript e Enums** refletindo perfeitamente os contratos da API.

**Fase 3: Camada de Integração (HTTP Services)**
5. Crie os serviços HTTP Angular (ex: `AuthService`, `UserService`, `DeliveryService`, `ReservationService`, `EquipmentReservationService`, `OccurrenceService`).
6. Crie o `WebPushService` implementando a lógica de inscrição do `SwPush` com VAPID (buscando a public key do backend e enviando a subscription).
7. Crie um Interceptor HTTP global para anexar o token JWT e tratar os erros padronizados (`StandardErrorDTO` / `ValidationErrorDTO`).

**Fase 4: Views e Componentes (A ser detalhado posteriormente)**
- *Atenção:* Só iniciaremos a criação de telas, rotas e formulários após a conclusão e validação rigorosa das Fases 1 a 3.

---
*Fim das instruções de refatoração. Aguardando o início da Fase 1.*