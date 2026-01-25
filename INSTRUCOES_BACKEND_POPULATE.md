# Instruções para o Backend - Populate de businesses e interacaos

## Problema Identificado

As rotas customizadas `/empresas/vendedor` e `/empresas/ausente` não estão retornando os dados de `businesses` e `interacaos` populados. O frontend precisa desses dados para exibir informações sobre negócios e interações nas listagens de empresas.

## Solução Necessária

### 1. Rota `/empresas/vendedor`

**Localização no backend:** `src/api/empresa/controllers/empresa.js` (método `vendedor`)

**O que precisa ser feito:**
- Garantir que ao usar `entityService.findMany` ou similar, os dados de `businesses` e `interacaos` sejam sempre populados
- Adicionar `populate` para incluir:
  - `businesses` com todos os campos (ou pelo menos: `etapa`, `andamento`, `date_conclucao`, `Budget`, `vendedor_name`, `pedidos`)
  - `interacaos` com campos: `proxima`, `vendedor_name`, `status_atendimento`, `descricao`, `tipo`, `objetivo`, `createdAt`

**Exemplo de populate necessário:**
```javascript
populate: {
  businesses: {
    populate: {
      pedidos: true,
      vendedor: {
        fields: ['username']
      }
    }
  },
  interacaos: {
    fields: ['proxima', 'vendedor_name', 'status_atendimento', 'descricao', 'tipo', 'objetivo', 'createdAt']
  },
  user: {
    fields: ['username']
  }
}
```

### 2. Rota `/empresas/ausente`

**Localização no backend:** `src/api/empresa/controllers/empresa.js` (método `ausente`)

**O que precisa ser feito:**
- Mesma configuração de `populate` da rota `vendedor`
- Garantir que `businesses` e `interacaos` sejam sempre populados

### 3. Campos Necessários em businesses

O frontend precisa dos seguintes campos de `businesses`:
- `etapa` (para filtrar negócios concluídos: `etapa === 6`)
- `andamento` (para filtrar negócios em andamento: `andamento === 3`)
- `date_conclucao` (para ordenar e exibir data)
- `Budget` (valor do negócio)
- `vendedor_name` (nome do vendedor)
- `pedidos` (relação populada com `totalGeral`)

### 4. Campos Necessários em interacaos

O frontend precisa dos seguintes campos de `interacaos`:
- `proxima` (data da próxima interação)
- `vendedor_name` (nome do vendedor que fez a interação)
- `status_atendimento` (status da interação)
- `descricao` (descrição da interação)
- `tipo` (tipo de contato)
- `objetivo` (objetivo do contato)
- `createdAt` (data de criação)

## Verificação

Após a implementação, verificar que a resposta JSON inclui:
```json
{
  "data": [
    {
      "id": "...",
      "attributes": {
        "nome": "...",
        "businesses": {
          "data": [
            {
              "id": "...",
              "attributes": {
                "etapa": 6,
                "andamento": 5,
                "date_conclucao": "...",
                "Budget": "...",
                "vendedor_name": "...",
                "pedidos": {
                  "data": [...]
                }
              }
            }
          ]
        },
        "interacaos": {
          "data": [
            {
              "id": "...",
              "attributes": {
                "proxima": "...",
                "vendedor_name": "...",
                "status_atendimento": "...",
                "descricao": "...",
                "tipo": "...",
                "objetivo": "...",
                "createdAt": "..."
              }
            }
          ]
        }
      }
    }
  ]
}
```

## Importante

- O `populate` deve ser aplicado **antes** da ordenação e paginação
- Garantir que mesmo quando não há `businesses` ou `interacaos`, os campos retornem como arrays vazios (`data: []`) e não como `null` ou `undefined`
- Manter a performance: usar `fields` para limitar campos quando possível, mas garantir que todos os campos necessários estejam incluídos
