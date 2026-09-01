# LunaLink — Documentação do Frontend

Documentação de referência para desenvolvimento das telas do **AppLuna** (Angular + Ionic PWA), derivada do *Documento de Requisitos — Sistema de Gestão do Condomínio Luna Village* (v1.0, 26/08/2026).

## Como usar esta documentação

**Antes de criar ou modificar qualquer tela**, consulte:

1. O módulo correspondente nesta pasta (`05` a `11`)
2. [Atores e permissões](./02-atores-permissoes.md)
3. [Design system](./03-design-system.md)
4. [Pendências e gaps](./13-pendencias-gaps-implementacao.md)

Se o pedido do usuário **contradizer** um requisito funcional, critério de aceite ou regra de permissão documentada aqui, **avise explicitamente** antes de implementar — descreva o conflito, cite o código do requisito (ex.: `RF-ENC-03`) e proponha alinhamento.

## Índice

| Arquivo | Conteúdo |
|---------|----------|
| [01-visao-geral.md](./01-visao-geral.md) | Objetivo, stack, módulos, convenções |
| [02-atores-permissoes.md](./02-atores-permissoes.md) | Papéis, guards, matriz de acesso por tela |
| [03-design-system.md](./03-design-system.md) | Spartan, Lucide, cores, padrões de UI |
| [04-navegacao-rotas.md](./04-navegacao-rotas.md) | Shell, abas, pilhas, rotas |
| [05-modulo-reservas-espacos.md](./05-modulo-reservas-espacos.md) | RES — Salão, Churrasqueira, Campo |
| [06-modulo-equipamentos.md](./06-modulo-equipamentos.md) | EQP — TV comunitária |
| [07-modulo-relatorios.md](./07-modulo-relatorios.md) | REL — Exportação mensal |
| [08-modulo-ocorrencias.md](./08-modulo-ocorrencias.md) | OCR — Registro e listagem |
| [09-modulo-encomendas.md](./09-modulo-encomendas.md) | ENC — Portaria e morador |
| [10-modulo-mural-comunicados.md](./10-modulo-mural-comunicados.md) | MUR — Comunicados |
| [11-modulo-usuarios.md](./11-modulo-usuarios.md) | USR — CRUD e perfil |
| [12-requisitos-nao-funcionais.md](./12-requisitos-nao-funcionais.md) | RNF aplicáveis ao frontend |
| [13-pendencias-gaps-implementacao.md](./13-pendencias-gaps-implementacao.md) | Escopo pendente e divergências código × requisito |

## Documentação relacionada

| Pasta/arquivo | Foco |
|---------------|------|
| [../00-overview.md](../00-overview.md) | Integração com backend |
| [../ROUTES.md](../ROUTES.md) | Mapa técnico de rotas |
| [../../design-guide.md](../../design-guide.md) | Guia visual legado (Ionic); preferir `03-design-system.md` para telas novas |

## Codificação de requisitos (referência)

| Prefixo | Significado |
|---------|-------------|
| `ATR-XX` | Ator (Síndico, Morador, Funcionário) |
| `RF-XX-YY` | Requisito funcional por módulo |
| `RNF-XX` | Requisito não funcional |
| `US-XX` | User story com critérios de aceite |

Módulos: `RES`, `EQP`, `REL`, `OCR`, `ENC`, `MUR`, `USR`.
