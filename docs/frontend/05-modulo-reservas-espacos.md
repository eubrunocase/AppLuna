# 05 — Módulo de Reservas de Espaços Comuns (RES)

Espaços: **Salão de Festas**, **Churrasqueira**, **Campo de Futebol**, **Academia** (catálogo estendido no app).

## Requisitos funcionais

| Código | Descrição | Status doc |
|--------|-----------|------------|
| RF-RES-01 | Solicitação: espaço, data, observações, convidados | OK |
| RF-RES-02 | Exclusividade diária (1 reserva/dia, exceto mesmo morador) | OK |
| RF-RES-03 | Bloqueio inadimplentes | OK |
| RF-RES-04 | Aprovação/reprovação síndico | OK |
| RF-RES-05 | Estado "Aguardando Inspeção" após aprovação | **Pendente** (data D-1) |
| RF-RES-06 | Vistoria pré-evento (funcionário) | OK — **sem tela** |
| RF-RES-07 | Termo de responsabilidade | OK — **sem tela** |
| RF-RES-08 | Confirmação após assinatura | OK — **sem tela** |
| RF-RES-09 | Vistoria pós-evento | OK — **sem tela** |
| RF-RES-10 | Lista convidados + check-in irreversível | OK — **sem tela** |
| RF-RES-11 | Síndico vê todas | OK |
| RF-RES-12 | Funcionário vê vistorias | OK — **sem tela** |
| RF-RES-13 | Morador vê só as próprias | OK |
| RF-RES-14 | Funcionário identificado na vistoria | OK — **sem tela** |

## User stories

| US | Título | Implementado |
|----|--------|--------------|
| US-01 | Solicitar reserva | **Parcial** — falta convidados e observações completas |
| US-02 | Aprovar/reprovar | **Sim** (aba Reservas, admin) |
| US-03 | Vistoria pré-evento | **Não** |
| US-04 | Assinar termo | **Não** |
| US-05 | Vistoria pós-evento | **Não** |
| US-06 | Convidados e check-in | **Não** |

## Telas implementadas

### Aba Reservas (`ReservationsTabPage`)
- **Rota:** `/app/reservations`
- **Atores:** Morador, Síndico
- **Funções:** listar, filtrar por tipo/status, aprovar/rejeitar (admin), cancelar
- **Design:** Spartan + Lucide (`03-design-system.md`)

### Fluxo nova reserva
1. **Etapa 1 — Espaço** (`ReservationSpaceStepPage`): radio cards com imagem
2. **Etapa 2 — Data** (`ReservationDateStepPage`): calendário Spartan, verificação disponibilidade

- **Rotas:** `/app/reservations/new/space`, `/app/reservations/new/date/:spaceId`
- **Progresso no header:** step 1/2

### Critérios de aceite (US-01) × implementação

| Critério | Status |
|----------|--------|
| Informar espaço e data | Sim |
| Observações | Verificar campo no fluxo |
| Lista de convidados | **Não implementado** |
| Bloqueio mesma data outro morador | Backend |
| Bloqueio inadimplente | Backend — UI deve tratar erro |
| Status "Aguardando Aprovação" após envio | Sim (`PENDING`) |

## Telas a implementar (futuro)

| Tela | Ator | Requisitos |
|------|------|------------|
| Fila vistoria pré-evento | Funcionário | RF-RES-06, US-03 |
| Formulário vistoria (foto/item) | Funcionário | RF-RES-06, RF-RES-14 |
| Termo de responsabilidade | Morador | RF-RES-07, US-04, RNF-10 |
| Vistoria pós-evento | Funcionário | RF-RES-09 |
| Gestão convidados | Morador | RF-RES-10, RNF-11 |
| Check-in convidados | Funcionário | RF-RES-10 |

## Notas de UX

- Status exibidos: `PENDING`, `APPROVED`, `REJECTED`, `CANCELLED`
- Admin: banner de pendentes + toggle Minhas/Condomínio
- Fotos de vistoria: aguardar decisão S3 (`RNF-03`, Seção 7 pendências)
