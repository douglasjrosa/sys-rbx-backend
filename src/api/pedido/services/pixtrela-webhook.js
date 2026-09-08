'use strict';

const crypto = require('crypto');

const WEBHOOK_TIMEOUT_MS = 5000;
const SIGNATURE_HEADER = 'X-Pixtrela-Signature';

function getConfig() {
  const url = process.env.PIXTRELA_WEBHOOK_URL;
  const secret = process.env.PIXTRELA_WEBHOOK_SECRET;
  if (!url || !secret) return null;
  return { url: url.replace(/\/+$/, ''), secret };
}

function signBody(body, secret) {
  const digest = crypto.createHmac('sha256', secret).update(body).digest('hex');
  return `sha256=${digest}`;
}

function isNonEmptyBpedido(value) {
  return typeof value === 'string' && value.trim() !== '';
}

function normalizeProdutoVersions(value) {
  let rows = [];
  if (Array.isArray(value)) {
    rows = value;
  } else if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed || trimmed === 'null') return [];
    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) rows = parsed;
    } catch (_err) {
      return [];
    }
  }

  const seen = new Set();
  const out = [];
  for (const entry of rows) {
    if (typeof entry !== 'string' && typeof entry !== 'number') continue;
    const code = String(entry).trim();
    if (!code || !/^\d+$/.test(code) || seen.has(code)) continue;
    seen.add(code);
    out.push(code);
  }
  return out;
}

function parsePedidoItensRows(itens) {
  if (itens == null) return [];
  if (Array.isArray(itens)) return itens;
  if (typeof itens === 'string') {
    const trimmed = itens.trim();
    if (!trimmed || trimmed === 'null') return [];
    try {
      const parsed = JSON.parse(trimmed);
      return Array.isArray(parsed) ? parsed : [];
    } catch (_err) {
      return [];
    }
  }
  return [];
}

/**
 * Attaches `versions` from Strapi produto records onto each pedido item.
 * Does not mutate stored pedido.itens — only the outbound webhook payload.
 */
async function enrichItensWithVersions(strapi, itens) {
  const rows = parsePedidoItensRows(itens);
  if (rows.length === 0) return rows;

  const prodIds = [
    ...new Set(
      rows
        .map((row) => {
          if (!row || typeof row !== 'object') return null;
          const n = Number(row.prodId);
          return Number.isInteger(n) && n > 0 ? n : null;
        })
        .filter((id) => id != null),
    ),
  ];

  const versionsByProdId = new Map();
  if (prodIds.length > 0) {
    const produtos = await strapi.entityService.findMany('api::produto.produto', {
      filters: { prodId: { $in: prodIds } },
      fields: ['prodId', 'versions'],
      limit: prodIds.length,
      publicationState: 'preview',
    });

    for (const produto of produtos || []) {
      const prodId = Number(produto.prodId);
      if (!Number.isInteger(prodId) || prodId <= 0) continue;
      versionsByProdId.set(prodId, normalizeProdutoVersions(produto.versions));
    }
  }

  return rows.map((row) => {
    if (!row || typeof row !== 'object') return row;
    const prodId = Number(row.prodId);
    const versions = versionsByProdId.get(prodId) || [];
    return { ...row, versions };
  });
}

/**
 * Loads the latest pedido row (draft or published). Pedido uses draftAndPublish;
 * Bpedido is set on UPDATE and often lives only on the draft until publish.
 */
async function loadPedidoForWebhook(strapi, id) {
  const pedido = await strapi.entityService.findOne('api::pedido.pedido', id, {
    fields: ['itens', 'dataEntrega', 'Bpedido'],
    populate: { empresa: { fields: ['nome'] } },
    publicationState: 'preview',
  });

  if (!pedido || !isNonEmptyBpedido(pedido.Bpedido)) {
    return null;
  }

  const empresaNome = pedido.empresa?.nome?.trim() || 'Sem empresa';
  const itens = await enrichItensWithVersions(strapi, pedido.itens);

  return {
    pedidoId: pedido.id,
    Bpedido: pedido.Bpedido.trim(),
    itens,
    dataEntrega: pedido.dataEntrega ?? null,
    empresaNome,
  };
}

async function sendPixtrelaWebhook(strapi, payload) {
  const config = getConfig();
  if (!config) {
    strapi.log.warn('[pixtrela-webhook] PIXTRELA_WEBHOOK_URL or SECRET not set');
    return;
  }

  const body = JSON.stringify(payload);
  const signature = signBody(body, config.secret);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), WEBHOOK_TIMEOUT_MS);

  try {
    const response = await fetch(config.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        [SIGNATURE_HEADER]: signature,
      },
      body,
      signal: controller.signal,
    });

    if (!response.ok) {
      const responseText = await response.text().catch(() => '');
      strapi.log.warn(
        `[pixtrela-webhook] HTTP ${response.status} for pedido ${payload.pedidoId}: ${responseText.slice(0, 200)}`,
      );
      return;
    }

    strapi.log.info(
      `[pixtrela-webhook] sent pedido ${payload.pedidoId} (${payload.Bpedido})`,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    strapi.log.warn(
      `[pixtrela-webhook] failed for pedido ${payload.pedidoId}: ${message}`,
    );
  } finally {
    clearTimeout(timeout);
  }
}

async function notifyPixtrela(strapi, pedidoId) {
  const payload = await loadPedidoForWebhook(strapi, pedidoId);
  if (!payload) {
    strapi.log.debug(
      `[pixtrela-webhook] skip pedido ${pedidoId}: missing or empty Bpedido`,
    );
    return;
  }
  void sendPixtrelaWebhook(strapi, payload);
}

module.exports = {
  notifyPixtrela,
  signBody,
  isNonEmptyBpedido,
  loadPedidoForWebhook,
  normalizeProdutoVersions,
  enrichItensWithVersions,
  parsePedidoItensRows,
};
