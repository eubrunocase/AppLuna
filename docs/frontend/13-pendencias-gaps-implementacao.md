# 13 — Pendências, gaps e divergências

Consolida o que está **pendente no documento de requisitos** (Seção 7) e o que **diverge da implementação atual**.

## Pendências do documento original (Seção 7)

| Item | Impacto frontend |
|------|------------------|
| Data exata vistoria pré-evento (D-1?) | Telas de vistoria e status "Aguardando Inspeção" |
| Estratégia fotos (S3 vs alternativas) | Upload vistorias, comunicados, encomendas |
| Queries JPA reservas | Pode afetar dados exibidos até backend estabilizar |

## Módulos não implementados ou incompletos

| Módulo | Gap |
|--------|-----|
| RES | Vistorias, termo, convidados, check-in |
| MUR | Mural/comunicados inteiro |
| USR | Tela de perfil (`RF-USR-03`) |
| REL | Confirmar formatos export docx/PDF |
| Real-time | Subscriber WebSocket na UI |
| Push | Link para tela de notificações |

## Divergências código × requisito (importante)

Use esta tabela ao receber pedidos do usuário. Se o pedido **reforçar** uma divergência, **avisar** que contraria o documento de requisitos.

| # | Requisito | O que o doc diz | O que o app faz hoje | Severidade |
|---|-----------|-----------------|---------------------|------------|
| 1 | `RF-ENC-03`, `US-12` | **Funcionário** registra retirada | Morador pode "Marcar como recebida" na aba Entregas | **Alta** |
| 2 | `RF-ENC-01`, `US-11` | Protocolo, discriminação e **foto obrigatórios** | Campos opcionais; sem upload de foto | **Alta** |
| 3 | `RF-ENC-01` | Destinatário morador **ou** nome livre | Apenas combobox de morador cadastrado | **Média** |
| 4 | `RF-OCR-04` | Funcionário vê listagem ocorrências | Funcionário sem aba Ocorrências | **Média** |
| 5 | `RF-ENC-05` | Funcionário lista **todas** encomendas | Aba Entregas filtra por `userId` para todos | **Média** |
| 6 | `RF-RES-01`, `US-01` | Lista de convidados na solicitação | Fluxo reserva sem convidados | **Alta** |
| 7 | `RF-RES-05` | Status "Aguardando Inspeção" | Fluxo simplificado PENDING→APPROVED | **Média** (pendente doc) |
| 8 | `design-guide.md` | Paleta Ionic `#bf3b03` | Design system `#C05C46` cream | **Baixa** — preferir `03-design-system.md` |

## Divergências recentes de UX (encomendas)

Alterações feitas na sessão de desenvolvimento que **não** estão no doc de requisitos original (OK como melhoria, desde que não violem RF):

- Combobox pesquisável por nome (sem exibir apartamento) — alinhado a UX, OK
- Remoção de subtítulo abaixo do destinatário — OK
- Campos protocolo/descrição ainda opcionais — **desalinhado** com US-11

## Processo quando houver conflito

1. Identificar código RF/US/RNF afetado
2. Informar o usuário em português, citando o requisito
3. Perguntar se deseja: **(a)** alinhar ao requisito, **(b)** atualizar documentação com decisão consciente, ou **(c)** manter exceção temporária
4. Se (b): atualizar o módulo correspondente nesta pasta

## Histórico de decisões

| Data | Decisão | Arquivo |
|------|---------|---------|
| — | Documentação frontend criada a partir do doc v1.0 (26/08/2026) | `docs/frontend/` |

> Registrar aqui decisões futuras que alterem requisitos após conversa com o usuário.
