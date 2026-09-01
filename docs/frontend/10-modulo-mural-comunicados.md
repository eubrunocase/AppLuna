# 10 — Módulo de Mural e Comunicados (MUR)

## Requisitos funcionais

| Código | Descrição |
|--------|-----------|
| RF-MUR-01 | Síndico publica comunicado (descrição + imagem) |
| RF-MUR-02 | Síndico edita comunicados |
| RF-MUR-03 | Moradores notificados em nova publicação |
| RF-MUR-04 | Moradores e funcionários consultam histórico |
| RF-MUR-05 | Somente síndico publica/edita |

## User story US-13

| Critério | Status frontend |
|----------|-----------------|
| Publicar e editar (síndico) | **Não implementado** |
| Notificar moradores | Backend — UI sem subscriber |
| Histórico para morador/funcionário | **Não implementado** |

## Estado atual

- **Home:** card estático "Avisos" com mensagem fixa (`home-tab.page.html`) — **não** substitui o mural
- **Sem rotas** dedicadas a comunicados
- **Sem CRUD** de comunicados no frontend

## Telas a implementar

| Tela | Rota sugerida | Ator | Funções |
|------|---------------|------|---------|
| Mural / lista | `/app/notices` ou seção na Home | Todos (leitura) | Listar comunicados com imagem |
| Detalhe | `/app/notices/:id` | Todos | Ver descrição + imagem |
| Criar/editar | `/app/home/admin/notices/new` | Síndico | Form descrição + upload imagem |

## Design

- Listagem estilo feed ou cards com imagem destacada
- Upload de imagem: aguardar estratégia S3 (`RNF-03`, pendência Seção 7)
- Notificação push/WebSocket ao publicar (`RF-MUR-03`)

## Ao implementar

Consultar `RF-MUR-01`–`05` e validar endpoints no [../02-api-reference.md](../02-api-reference.md) antes de definir campos.
