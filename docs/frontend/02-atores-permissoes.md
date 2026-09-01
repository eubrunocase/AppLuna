# 02 — Atores e permissões

Fonte: Seção 2 do Documento de Requisitos + implementação em `auth.guard.ts` e `auth.service.ts`.

## Atores

| Código | Ator | Role backend | Enum frontend |
|--------|------|--------------|---------------|
| ATR-01 | Síndico | `ADMIN_ROLE` | `UserRoles.ADMIN_ROLE` |
| ATR-02 | Morador | `RESIDENT_ROLE` | `UserRoles.RESIDENTE_ROLE` |
| ATR-03 | Funcionário | `EMPLOYEE_ROLE` | `UserRoles.EMPLOYEE` |

> O enum expõe alias `RESIDENT_ROLE` e `RESIDENTE_ROLE` com o mesmo valor.

## Guards de rota

| Guard | Quem passa |
|-------|------------|
| `authGuard` | Qualquer autenticado |
| `guestGuard` | Apenas não autenticado (login) |
| `adminGuard` | Síndico |
| `residentOrAdmin` | Morador + Síndico |
| `adminOrEmployee` | Síndico + Funcionário |
| `roleGuard([...])` | Lista customizada |

## Matriz de acesso por área

| Funcionalidade | Síndico | Morador | Funcionário | Requisitos |
|----------------|---------|---------|-------------|------------|
| Home / dashboard | Sim | Sim | Sim | RNF-08 |
| Aba Reservas | Sim | Sim | **Não** (dock oculto) | RF-RES-11/12/13 |
| Aba Entregas | Sim | Sim | Sim | RF-ENC-05/06 |
| Aba Ocorrências | Sim | Sim | **Não** (dock oculto) | RF-OCR-04 |
| Solicitar reserva espaço | Sim | Sim | Não | RF-RES-01 |
| Aprovar/rejeitar reserva | Sim | Não | Não | RF-RES-04 |
| Vistorias pré/pós-evento | Não | Não | Sim | RF-RES-06/09 |
| Assinar termo | Não | Sim | Não | RF-RES-07/08 |
| Lista convidados / check-in | Sim* | Sim | Sim* | RF-RES-10 |
| Reservar TV | Sim | Sim | Não | RF-EQP-01 |
| Handover/devolução TV | Sim | Não | Sim | RF-EQP-04–07 |
| Relatório mensal | Sim | Não | Não | RF-REL-04 |
| Registrar ocorrência | Sim** | Sim | Sim** | RF-OCR-01 |
| Listar ocorrências (read-only) | Sim | Sim | Sim | RF-OCR-04 |
| Registrar encomenda | Sim | Não | Sim | RF-ENC-01 |
| Confirmar retirada encomenda | Sim | **Ver nota** | Sim | RF-ENC-03 |
| Listar todas encomendas | Sim | Não | Sim*** | RF-ENC-05 |
| Ver próprias encomendas | Sim | Sim | — | RF-ENC-06 |
| Publicar comunicados | Sim | Não | Não | RF-MUR-05 |
| Ver comunicados | Sim | Sim | Sim | RF-MUR-04 |
| CRUD usuários | Sim | Não | Não | RF-USR-01/02 |
| Ver próprio perfil | Sim | Sim | Sim | RF-USR-03 |

\* Fluxo de convidados/check-in **não implementado** no frontend atual.  
\*\* Requisito original: morador registra; listagem é read-only para todos.  
\*\*\* Funcionário deve gerenciar portaria — ver gap em `13-pendencias-gaps-implementacao.md`.  
**Nota ENC:** `RF-ENC-03` e `US-12` atribuem retirada ao **funcionário**. A aba morador hoje permite "marcar como recebida" — **divergência documentada**.

## Regras de UI por perfil

### Síndico (admin)
- Layout administrativo na Home (aprovações pendentes, métricas).
- Toggle "Minhas / Condomínio" na aba Reservas.
- Acesso a Usuários e Relatórios via Acesso Rápido.
- Pode listar todas as encomendas e reservas.

### Morador
- Home com encomendas pendentes e reservas ativas.
- Vê apenas **próprias** reservas (`RF-RES-13`) e **próprias** encomendas (`RF-ENC-06`).
- Bloqueado se inadimplente (`RF-RES-03`, `RF-EQP-03`) — backend retorna erro; UI deve exibir mensagem clara.

### Funcionário
- Dock reduzido (sem Reservas/Ocorrências na implementação atual).
- Foco operacional: encomendas, equipamentos, vistorias (quando existirem).
- Não aprova reservas nem gerencia usuários.

## Ao implementar nova tela

Checklist:

- [ ] Qual ator usa esta tela? (`ATR-01/02/03`)
- [ ] Guard de rota correto?
- [ ] Botões/ações visíveis só para papéis autorizados?
- [ ] Dados filtrados no client **e** no server (morador só vê os seus)?
- [ ] Conflito com requisito? → avisar o usuário antes de codar.
