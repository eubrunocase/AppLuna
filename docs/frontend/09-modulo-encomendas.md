# 09 — Módulo de Encomendas (ENC)

## Requisitos funcionais

| Código | Descrição |
|--------|-----------|
| RF-ENC-01 | Registro: destinatário (morador **ou** nome livre), protocolo, discriminação, **foto comprovação** |
| RF-ENC-02 | Notificar morador ao registrar |
| RF-ENC-03 | Funcionário marca `DELIVERED` e informa quem retirou (texto livre) |
| RF-ENC-04 | Notificar morador após retirada |
| RF-ENC-05 | Síndico lista todas |
| RF-ENC-06 | Morador vê **somente as próprias** |

## User stories

### US-11 — Registrar recebimento (Funcionário)

| Critério | Esperado |
|----------|----------|
| Morador cadastrado **ou** nome livre | Campo destinatário flexível |
| Protocolo, discriminação e **foto obrigatórios** | Ver gaps abaixo |
| Notificação automática | Backend + WebSocket |

### US-12 — Registrar retirada (Funcionário)

| Critério | Esperado |
|----------|----------|
| Quem retirou (texto livre) | Dialog/input na gestão |
| Status → `DELIVERED` | Sim |
| Notificação morador | Backend |

## Telas

### Aba Entregas — morador (`DeliveriesTabPage`)
- **Rota:** `/app/deliveries`
- **Ator:** Morador (e outros perfis na aba)
- **Dados:** `findByUser(currentUserId)` — apenas próprias (`RF-ENC-06`)
- **Filtros:** Todas / Pendentes / Retiradas
- **Design:** Spartan + Lucide

### Gestão portaria (`DeliveriesPage`)
- **Rotas:** `/app/deliveries/manage`, `/app/home/deliveries/manage`
- **Atores:** Síndico, Funcionário
- **Dados:** `findAll()` — todas (`RF-ENC-05`)
- **Ação:** Confirmar retirada com nome (`RF-ENC-03`) via `hlm-alert-dialog`

### Nova encomenda (`DeliveryCreatePage`)
- **Rotas:** `/app/deliveries/new`, `/app/home/deliveries/manage/new`
- **Guard:** `adminOrEmployee`
- **Ator:** Funcionário, Síndico

#### Campos conforme requisito × implementação atual

| Campo | RF-ENC-01 / US-11 | Implementação atual | Conforme? |
|-------|-------------------|---------------------|-----------|
| Destinatário (morador) | Sim | Combobox pesquisável por nome | Parcial — falta nome livre |
| Destinatário (texto livre) | Sim | **Não implementado** | **Não** |
| Protocolo | Obrigatório (US-11) | Opcional | **Não** |
| Discriminação | Obrigatório (US-11) | Opcional (campo "Descrição") | **Não** |
| Foto comprovação | Obrigatório | **Não implementado** | **Não** |
| Recebido por (portaria) | Não no RF (campo extra API) | `otherRecipient` opcional | Extra OK |

#### Especificação alvo da tela Nova Encomenda

1. **Destinatário:** combobox pesquisável de moradores **ou** toggle/campo para destinatário externo (nome livre)
2. **Protocolo:** obrigatório
3. **Discriminação:** obrigatório (descrição do volume — caixa, envelope, etc.)
4. **Foto:** upload/câmera obrigatório (`image` base64 na API — ver `RequestDeliveryDTO`)
5. **Recebido por (portaria):** opcional — quem recebeu fisicamente na portaria
6. **Sem** texto descritivo/subtítulo abaixo do combobox de destinatário (apenas label + campo + erro de validação)

### Confirmar retirada — quem pode?

| Ator | RF-ENC-03 | Implementação | Conforme? |
|------|-----------|---------------|-----------|
| Funcionário | Sim | Sim (`DeliveriesPage`) | Sim |
| Síndico | Sim (gestão total) | Sim | Sim |
| Morador | **Não** | Aba morador só lista/consulta | Sim |

## Status

| Status | Label UI | Significado |
|--------|----------|-------------|
| `PENDING` | Pendente | Aguardando retirada |
| `DELIVERED` | Entregue / Retirada | Retirada registrada |

## API relevante

- `POST /delivery/create` — `RequestDeliveryDTO` (`user`, `protocolNumber`, `discrimination`, `image`, `otherRecipient`)
- `PUT /delivery/confirm/{id}` — `pickedUpBy`

Ver [../03-data-models.md](../03-data-models.md).
