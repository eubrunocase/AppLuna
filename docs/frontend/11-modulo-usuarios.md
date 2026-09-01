# 11 — Módulo de Usuários (USR)

## Requisitos funcionais

| Código | Descrição |
|--------|-----------|
| RF-USR-01 | CRUD usuários (síndico) |
| RF-USR-02 | Somente síndico cria usuários |
| RF-USR-03 | Morador e funcionário veem **próprio perfil** |
| RF-USR-04 | Papéis + layout por perfil |

## User story US-14

| Critério | Status |
|----------|--------|
| CRUD só síndico | **Sim** (`UsersPage`, admin guard) |
| Papel na criação | Sim |
| Perfil próprio morador/funcionário | **Parcial** — sem tela de perfil dedicada |

## Telas

### Gestão de usuários
- **Página:** `UsersPage`
- **Rota:** `/app/home/admin/users`
- **Guard:** `adminGuard`
- **UI:** Ionic legado (candidata a migração Spartan)
- **Funções:** listar, criar, editar, excluir

### Perfil do usuário
- **Requisito:** `RF-USR-03`
- **Estado:** **Não implementado** como tela
- **Sugestão:** `/app/home/profile` ou item no header — exibir nome, e-mail, unidade, papel (read-only para morador/funcionário)

## Papéis na criação

| Papel | Valor | Layout resultante |
|-------|-------|-------------------|
| Síndico | `ADMIN_ROLE` | Admin |
| Morador | `RESIDENT_ROLE` | Morador |
| Funcionário | `EMPLOYEE_ROLE` | Operacional/portaria |

## Push notifications (adjacente)

- **Rota:** `/app/home/settings/notifications`
- **Guard:** auth (todos autenticados)
- **Gap:** sem link na UI principal
