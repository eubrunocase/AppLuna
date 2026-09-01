# 03 — Design system

Referência para telas novas e refatorações. Preferir este guia sobre `design-guide.md` (legado Ionic).

## Stack UI

| Recurso | Uso |
|---------|-----|
| **Spartan NG (Helm)** | `hlmBtn`, `hlmCard`, `hlmField`, `hlmInput`, `hlmSpinner`, `hlmSkeleton`, `hlm-alert-dialog` |
| **Lucide** | `@ng-icons/lucide` + `NgIcon` + `provideIcons({ lucideX, … })` |
| **Ionic** | Shell: `IonContent`, `IonRefresher`; evitar `ion-card`, `ion-segment`, `ion-button` em telas migradas |
| **Tailwind** | Utilitários via preset Spartan; tokens em `src/tailwind.css` |

Provider global: `provideSpartanHlm()` em `main.ts`.

## Paleta LunaLink

| Token | Hex | Uso |
|-------|-----|-----|
| Terracotta (primary) | `#C05C46` | Botões primários, ícones, FAB |
| Gold (secondary) | `#E3A847` | Destaques, pendências |
| Cream (background) | `#F9F6EE` | Fundo de páginas (`--background`) |
| Dark brown (text) | `#361A14` | Títulos |
| Muted brown | `#8A5A4E` | Subtítulos, meta |
| Success green | `#047857` / `#3D8B5F` | Status positivo, ações confirmar |
| Warning orange | `#C2410C` | Status pendente |
| Danger red | `#B91C1C` | Erros, cancelamentos |

Arquivos: `src/theme/variables.scss`, `src/tailwind.css`.

## Tipografia

- **Sans:** Inter (corpo e UI)
- **Display/logo:** Moara (marca no shell)
- Títulos de seção: `font-weight: 700`, `color: #361A14`
- Labels de campo: uppercase, `0.8125rem`, `#6A3327`

## Padrões de componentes

### Página de listagem
- Fundo `#F9F6EE`, padding horizontal `1rem`
- Filtros: chips horizontais scrolláveis (ver `reservations-tab`, `deliveries-tab`)
- Cards: `hlmCard size="sm"`, borda `rgba(192, 92, 70, 0.12)`, sombra suave
- Status: pill com dot (`status-pill--PENDING`, `--DELIVERED`, etc.)
- Loading: `hlmSkeleton` (3–4 placeholders)
- Empty state: ícone Lucide em círculo terracotta claro + título + mensagem
- FAB fixo: canto inferior direito, `bottom: var(--app-fab-bottom, 5rem)`

### Formulários
- `hlm-field-group` > `hlm-field` > `hlmFieldLabel` + input
- Ícone Lucide à esquerda do input (`input-with-icon`, `field-icon`)
- Inputs: altura ~`2.85rem`, border-radius `0.85rem`, fundo branco
- Erros: `hlm-field-error` com `[forceShow]="true"` após touch
- Submit: `hlmBtn` full width, `#C05C46`, spinner durante submit

### Combobox pesquisável
- Componente: `app-searchable-combobox` (`shared/components/searchable-combobox`)
- Usar para listas longas (moradores); **não** usar `hlm-select` com portal dentro de `ion-content` (quebra layout mobile)
- Exibir apenas o **nome** no campo; apartamento pode entrar em `keywords` para busca

### Diálogos
- Confirmação simples: `app-confirm-dialog`
- Confirmação com input: `hlm-alert-dialog` + `hlmInput`

### Feedback
- Sucesso/erro: `UiService.showSuccess` / `showError` (toast Ionic)
- Loading bloqueante: `UiService.showLoading` (usar com moderação)

## Acessibilidade mínima

- `role="tablist"` / `role="tab"` em filtros
- `aria-label` em FABs e botões só-ícone
- `aria-invalid` em campos com erro
- Respeitar `prefers-reduced-motion` em animações customizadas

## Referência visual

Telas de referência já alinhadas ao design system:

- `pages/tabs/reservations-tab/`
- `pages/tabs/deliveries-tab/`
- `pages/deliveries/` (gestão + create)
- `pages/login/`
- `pages/tabs/home-tab/`
