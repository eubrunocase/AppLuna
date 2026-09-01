# 12 — Requisitos não funcionais (frontend)

Requisitos do documento de requisitos aplicáveis diretamente ao frontend.

| Código | Descrição | Implicação no frontend |
|--------|-----------|------------------------|
| RNF-01 | PWA instalável, mobile + desktop | `@angular/pwa`, manifest, service worker; layout responsivo |
| RNF-02 | Notificações tempo real WebSocket/STOMP | Conectar STOMP; toasts/badges em eventos |
| RNF-03 | Fotos em object storage (S3), não PG | Upload via URL pré-assinada; exibir imagens por URL |
| RNF-04 | Ocorrências imutáveis | Sem UI de edição/exclusão |
| RNF-05 | REST API | Services Angular + interceptors |
| RNF-06 | RBAC no backend | Guards + ocultar ações; tratar 403 |
| RNF-07 | AWS | Deploy/hosting — fora do código app |
| RNF-08 | Layout/navegação por perfil | Dock condicional, Home diferenciada admin |
| RNF-09 | Exclusividade reservas no backend | Exibir erros 409 claramente |
| RNF-10 | Assinatura termo com timestamp | Tela termo futura — registrar confirmação explícita |
| RNF-11 | Check-in convidado irreversível | Confirmação forte antes de check-in |

## PWA (RNF-01)

- Instalável via browser
- Funciona em viewport mobile (prioridade) e desktop
- **Não** há build Capacitor nativo

## Tempo real (RNF-02)

Eventos esperados (via backend):

- Aprovação/reprovação reserva
- Nova encomenda / retirada
- Novo comunicado
- Nova ocorrência

**Estado:** conexão STOMP inicializada; consumo na UI **incompleto**.

## Segurança (RNF-06)

- JWT access token (memória/storage conforme `06-authentication-jwt-refactor.md`)
- Interceptor adiciona `Authorization: Bearer`
- Refresh em 401
- **Nunca** confiar só na UI para autorização

## Integridade (RNF-04, RNF-11)

- Ocorrências: formulário com aviso de irreversibilidade
- Check-in (futuro): dialog de confirmação sem undo

## Armazenamento de mídia (RNF-03)

Pendente decisão infra (Seção 7). Até lá:

- Encomendas: campo `image` na API existe (base64)
- Vistorias/comunicados: **não implementar** upload definitivo sem alinhamento S3
