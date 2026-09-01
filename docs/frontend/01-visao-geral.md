# 01 — Visão geral do frontend

## Objetivo

O **LunaLink** digitaliza a gestão do Condomínio Luna Village em um **PWA** (Progressive Web App) com:

- Reservas de espaços comuns e equipamentos
- Ocorrências
- Encomendas (portaria)
- Comunicados (mural)
- Administração de usuários e relatórios

O frontend consome APIs REST do backend Spring Boot e recebe eventos em tempo real via **WebSocket/STOMP** (`RNF-02`, `RNF-05`).

## Stack técnica

| Camada | Tecnologia |
|--------|------------|
| Framework | Angular 22 (standalone components) |
| UI mobile | Ionic 8 (`IonContent`, refresher, shell) |
| Design system | Spartan NG (Helm) + Tailwind 4 |
| Ícones | Lucide via `@ng-icons/lucide` |
| Estado/rede | RxJS, services injectáveis |
| Auth | JWT access + refresh (`docs/06-authentication-jwt-refactor.md`) |
| Tempo real | `@stomp/stompjs` + SockJS |

## Organização do código

```
src/app/
├── core/           # Shell, guards, rotas, modelos
├── pages/          # Telas por domínio
├── services/       # Integração API
└── shared/         # Componentes reutilizáveis (dialogs, combobox, date-picker)
libs/ui/            # Componentes Spartan locais (button, card, field, …)
docs/frontend/      # Esta documentação
```

## Princípios de implementação

1. **Permissões no backend são a fonte da verdade** — guards e UI espelham papéis, mas não substituem validação server-side (`RNF-06`).
2. **Layout por perfil** — síndico, morador e funcionário têm navegação e ações distintas (`RNF-08`, `RF-USR-04`).
3. **Telas novas** seguem Spartan + Lucide + tokens em `03-design-system.md`; evitar novos padrões Ionic legados (`ion-card`, `ion-segment`) salvo exceção justificada.
4. **Listagens** devem ter skeleton loading, pull-to-refresh e empty state.
5. **Ações destrutivas ou irreversíveis** usam confirmação (`app-confirm-dialog` ou `hlm-alert-dialog`).

## Módulos × telas (mapa rápido)

| Módulo | Telas principais no app |
|--------|-------------------------|
| RES | Aba Reservas, fluxo nova reserva (espaço → data), aprovação admin |
| EQP | Reserva TV, gestão handover/devolução |
| REL | Relatórios mensais (admin) |
| OCR | Aba Ocorrências, nova ocorrência |
| ENC | Aba Entregas, gestão portaria, nova encomenda |
| MUR | *Não implementado* — avisos estáticos na Home |
| USR | CRUD usuários (admin), perfil *parcial* |

Detalhes por módulo nos arquivos `05`–`11`.
