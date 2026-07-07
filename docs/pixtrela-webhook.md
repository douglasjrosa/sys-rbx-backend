# Pixtrela webhook (pedido → tasks)

When a CRM `pedido` is created or updated with a non-empty `Bpedido`, the backend
notifies Pixtrela to create or update production tasks in real time.

## Environment variables

| Variable | Description |
|----------|-------------|
| `PIXTRELA_WEBHOOK_URL` | Full URL, e.g. `https://app.pixtrela.com.br/api/webhooks/crm-pedido` |
| `PIXTRELA_WEBHOOK_SECRET` | Shared HMAC secret (same value as `CRM_WEBHOOK_SECRET` on Pixtrela) |

Requires Node 18+ for native `fetch` in the webhook sender.

## Trigger rules

- **afterCreate**: always evaluated; webhook sent only if `Bpedido` is non-empty after reload.
- **afterUpdate**: sent only when `Bpedido`, `itens`, `dataEntrega`, or `empresa` changed.

## Payload

```json
{
  "pedidoId": 123,
  "Bpedido": "B-456",
  "itens": [],
  "dataEntrega": "2026-07-15",
  "empresaNome": "Cliente X"
}
```

Header: `X-Pixtrela-Signature: sha256=<hmac-hex>` (HMAC-SHA256 of the raw JSON body).

## Failure handling

Webhook delivery is fire-and-forget. Failures are logged via Strapi logger; the pedido
save is never blocked. Pixtrela upsert is idempotent by `crmItemKey`.
