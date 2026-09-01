# 06 — Módulo de Reserva de Equipamentos (EQP)

Equipamento: **Televisão comunitária**.

## Requisitos funcionais

| Código | Descrição | Status doc |
|--------|-----------|------------|
| RF-EQP-01 | Reserva TV: horário início/fim, confirmação automática | OK |
| RF-EQP-02 | Conflito com Salão/Churrasqueira na mesma data | OK |
| RF-EQP-03 | Bloqueio inadimplentes | OK |
| RF-EQP-04 | Funcionário confere reserva antes de entregar controle | OK |
| RF-EQP-05 | Status "Em Uso" após entrega | OK |
| RF-EQP-06 | Registro horário devolução | OK |
| RF-EQP-07 | Status "Encerrada" após confirmação funcionário | OK |
| RF-EQP-08 | Síndico e funcionário listam todas | OK |

## User stories

| US | Título | Implementado |
|----|--------|--------------|
| US-07 | Reservar TV | **Sim** |
| US-08 | Entrega/devolução controle | **Sim** (gestão) |

## Telas

### Criar reserva TV
- **Página:** `EquipmentReservationCreatePage`
- **Rota:** `/app/home/tv/new`
- **Ator:** Morador, Síndico
- **Campos:** data, horário início, horário fim
- **Resultado:** status `CONFIRMED` automático (sem aprovação síndico)

### Gestão equipamentos (portaria)
- **Página:** `EquipmentReservationsPage`
- **Rota:** `/app/home/equipment/manage`
- **Atores:** Síndico, Funcionário
- **Ações:** entregar controle → `IN_USE`, confirmar devolução → `RETURNED`/`ENCERRADA`

### Listagem na aba Reservas
- Tipo filtro `TELEVISAO` unifica reservas de TV com espaços
- Status EQP: `CONFIRMED`, `IN_USE`, `RETURNED`, `CANCELED`

## Status da reserva TV

| Status | Label UI | Significado |
|--------|----------|-------------|
| CONFIRMED | Confirmado | Reservado, aguardando retirada |
| IN_USE | Em Uso | Controle entregue |
| RETURNED | Devolvido | Encerrado |
| CANCELED | Cancelado | Cancelado pelo morador |

## Regras de negócio (UI)

- Exibir erro claro se conflito com reserva de Salão/Churrasqueira (`RF-EQP-02`)
- Funcionário **não** entrega controle se reserva não confirmada (`RF-EQP-04`)
- Morador pode cancelar enquanto `CONFIRMED` (implementado na aba Reservas)
