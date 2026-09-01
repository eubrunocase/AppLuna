# 07 — Módulo de Relatórios (REL)

## Requisitos funcionais

| Código | Descrição |
|--------|-----------|
| RF-REL-01 | Síndico seleciona mês e exporta `.docx` ou PDF |
| RF-REL-02 | Apenas reservas **consumadas** de Salão, Churrasqueira e Campo; exclui reprovadas, canceladas e TV |
| RF-REL-03 | Conteúdo: espaço, data, nome e unidade do morador |
| RF-REL-04 | **Somente síndico** |

## User story US-09

**Implementado parcialmente** — tela existe, formato de exportação pode variar (PDF/Excel no código vs `.docx`/PDF no requisito).

## Tela

- **Página:** `ReportsPage`
- **Rota:** `/app/home/admin/reports`
- **Guard:** `adminGuard`
- **Ator:** Síndico (ATR-01)

## Comportamento esperado

1. Seletor de mês/ano
2. Preview ou lista das reservas elegíveis
3. Botão exportar
4. Download do arquivo gerado

## Checklist de conformidade

| Item | Verificar na implementação |
|------|---------------------------|
| Apenas admin acessa | Guard + ocultar link para outros perfis |
| Escopo correto (sem TV) | Alinhado com backend |
| Formatos docx/PDF | Confirmar endpoints disponíveis |
