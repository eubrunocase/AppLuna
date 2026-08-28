# Mapa de rotas e pilhas — AppLuna

## Prefixo autenticado: `/app`

Todas as rotas abaixo exigem `authGuard`, salvo indicação de guard específico.

## Pilhas por aba (dock)

| Aba | Raiz | Preserva pilha ao trocar aba |
|-----|------|------------------------------|
| Início | `/app/home` | Sim |
| Reservas | `/app/reservations` | Sim (`residentOrAdmin`) |
| Entregas | `/app/deliveries` | Sim |
| Ocorrências | `/app/occurrences` | Sim (`residentOrAdmin`) |

- **Toque na aba ativa:** volta à raiz da aba.
- **Toque em outra aba:** restaura a última URL salva daquela aba.
- **Acesso Rápido (Home):** empilha sobre `/app/home` via `push`.

## Home stack (Acesso Rápido)

| Rota | Tela | Guard |
|------|------|-------|
| `/app/home/reservation/new/space` | Nova reserva — etapa 1 | residentOrAdmin |
| `/app/home/reservation/new/date/:spaceId` | Nova reserva — etapa 2 | residentOrAdmin |
| `/app/home/tv/new` | Reservar TV | residentOrAdmin |
| `/app/home/occurrence/new` | Nova ocorrência | residentOrAdmin |
| `/app/home/deliveries/manage` | Gestão de entregas | auth |
| `/app/home/deliveries/manage/new` | Nova encomenda | adminOrEmployee |
| `/app/home/equipment/manage` | Equipamentos | adminOrEmployee |
| `/app/home/admin/users` | Usuários | admin |
| `/app/home/admin/reports` | Relatórios | admin |
| `/app/home/settings/notifications` | Push | auth |

## Reservas stack

| Rota | Tela |
|------|------|
| `/app/reservations/new/space` | Nova reserva — etapa 1 |
| `/app/reservations/new/date/:spaceId` | Nova reserva — etapa 2 |

Query params: `?view=all&status=PENDING` (fila de aprovação admin).

## Entregas stack

| Rota | Tela | Guard |
|------|------|-------|
| `/app/deliveries/manage` | Gestão portaria | auth |
| `/app/deliveries/new` | Nova encomenda | adminOrEmployee |

## Ocorrências stack

| Rota | Tela |
|------|------|
| `/app/occurrences/new` | Nova ocorrência |

## Rotas públicas

| Rota | Tela |
|------|------|
| `/login` | Login (`guestGuard`) |
| `/not-found` | 404 |

## Redirects legados

- `/tabs/*` → `/app/home`
- `/home` → `/app/home`
- `/**` → `/not-found`

## API de navegação (`AppNavigationService`)

| Método | Comportamento |
|--------|---------------|
| `selectTab(tab)` | Troca aba preservando pilha |
| `selectTabRoot(tab)` | Volta à raiz da aba |
| `push(url)` | Empilha tela |
| `pop()` | Remove topo da pilha |
| `completeFlow(url)` | Conclui fluxo e substitui pilha |
| `resetToHome()` | Reset autenticado para home |
| `resetApp()` | Logout → login |

## Shell visual

- **Header fixo:** título, subtítulo, voltar, logout, progresso (Nova Reserva), área expansível (Home).
- **Dock fixo:** 4 abas condicionais por perfil.
- **Conteúdo:** classe `shell-page-content` com offsets `--app-content-top/bottom`.
