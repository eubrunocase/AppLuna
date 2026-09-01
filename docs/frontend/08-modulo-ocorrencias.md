# 08 — Módulo de Ocorrências (OCR)

## Requisitos funcionais

| Código | Descrição |
|--------|-----------|
| RF-OCR-01 | Morador registra data, horário e descrição |
| RF-OCR-02 | Síndico notificado em tempo real (WebSocket) |
| RF-OCR-03 | Registros **imutáveis** após envio |
| RF-OCR-04 | Listagem read-only para todos os perfis |

## User story US-10

| Critério | Esperado |
|----------|----------|
| Sem edição após envio | Sem botões editar/excluir na UI |
| Notificação síndico | WebSocket (`RNF-02`) |
| Listagem visível a todos | Morador, síndico, funcionário |

## Telas

### Aba Ocorrências
- **Página:** `OccurrencesTabPage`
- **Rota:** `/app/occurrences`
- **Atores:** Morador, Síndico (funcionário **sem aba** no dock atual)
- **Função:** histórico read-only

> **Gap:** `RF-OCR-04` prevê funcionário na listagem; dock oculta aba para funcionário.

### Nova ocorrência
- **Página:** `OccurrenceCreatePage`
- **Rotas:** `/app/occurrences/new`, `/app/home/occurrence/new`
- **Ator principal:** Morador (`RF-OCR-01`)
- **Campos:** data, horário, descrição

## Regras de UI

- **Nunca** exibir ações de edição ou exclusão (`RF-OCR-03`, `RNF-04`)
- Informar ao usuário que o registro é definitivo antes do submit
- Anonimato: UI pode indicar que ocorrências são visíveis ao condomínio (conforme copy da tela)

## Notificações

- Backend envia evento STOMP — frontend deve exibir toast/badge quando subscriber for implementado (ver `13-pendencias-gaps-implementacao.md`)
