# 04 — Navegação e rotas

Mapa técnico completo: [../ROUTES.md](../ROUTES.md).  
Constantes: `src/app/core/navigation/app-routes.ts`.

## Shell autenticado (`/app`)

```
AppShellComponent
├── Header fixo (título, voltar, logout, progresso)
├── IonRouterOutlet (conteúdo)
└── Dock (4 abas, condicional por perfil)
```

Classe de conteúdo: `shell-page-content` — respeita `--app-content-top` e `--app-content-bottom`.

## Abas (dock)

| Aba | Rota raiz | Visível para |
|-----|-----------|--------------|
| Início | `/app/home` | Todos |
| Reservas | `/app/reservations` | Morador, Síndico |
| Entregas | `/app/deliveries` | Todos |
| Ocorrências | `/app/occurrences` | Morador, Síndico |

Comportamento (`AppNavigationService`):

- Toque na aba **ativa** → volta à raiz da aba
- Toque em **outra aba** → restaura última URL da pilha
- **Acesso Rápido** (Home) → `push` sobre `/app/home`

## Pilhas principais

### Home — Acesso Rápido

| Rota | Tela | Guard |
|------|------|-------|
| `/app/home/reservation/new/space` | Reserva — escolher espaço | residentOrAdmin |
| `/app/home/reservation/new/date/:spaceId` | Reserva — escolher data | residentOrAdmin |
| `/app/home/tv/new` | Reservar TV | residentOrAdmin |
| `/app/home/occurrence/new` | Nova ocorrência | residentOrAdmin |
| `/app/home/deliveries/manage` | Gestão entregas | auth |
| `/app/home/deliveries/manage/new` | Nova encomenda | adminOrEmployee |
| `/app/home/equipment/manage` | Gestão TV | adminOrEmployee |
| `/app/home/admin/users` | Usuários | admin |
| `/app/home/admin/reports` | Relatórios | admin |
| `/app/home/settings/notifications` | Push notifications | auth |

### Reservas

| Rota | Tela |
|------|------|
| `/app/reservations/new/space` | Etapa 1 |
| `/app/reservations/new/date/:spaceId` | Etapa 2 |

Query params admin: `?view=all&status=PENDING`.

### Entregas

| Rota | Tela | Guard |
|------|------|-------|
| `/app/deliveries/manage` | Gestão portaria | auth |
| `/app/deliveries/new` | Nova encomenda | adminOrEmployee |

### Públicas

| Rota | Tela |
|------|------|
| `/login` | Login |
| `/not-found` | 404 |

## Configuração do shell por tela

Cada página chama `AppShellService.configure()` em `ionViewWillEnter`:

```typescript
this.shell.configure({
  title: 'Título',
  showBack: true | false,
  showLogo: true | false,
  showLogout: true | false,
  headerState: 'compact' | 'expanded',
  progressStep: number | null,  // fluxos multi-etapa
  progressTotal: number | null,
});
```

## Ao adicionar nova rota

1. Constante em `APP_ROUTES`
2. Entrada em `app.routes.ts` com guard adequado
3. Documentar neste arquivo e no módulo correspondente
4. Link de navegação (Home, FAB ou menu) para perfis corretos
