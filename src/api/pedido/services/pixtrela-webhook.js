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

async function loadPedidoForWebhook(strapi, id) {
  const pedido = await strapi.entityService.findOne('api::pedido.pedido', id, {
    fields: ['itens', 'dataEntrega', 'Bpedido'],
    populate: { empresa: { fields: ['nome'] } },
  });

  if (!pedido || !isNonEmptyBpedido(pedido.Bpedido)) {
    return null;
  }

  const empresaNome = pedido.empresa?.nome?.trim() || 'Sem empresa';

  return {
    pedidoId: pedido.id,
    Bpedido: pedido.Bpedido.trim(),
    itens: pedido.itens,
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
      strapi.log.warn(
        `[pixtrela-webhook] HTTP ${response.status} for pedido ${payload.pedidoId}`,
      );
    }
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
  if (!payload) return;
  void sendPixtrelaWebhook(strapi, payload);
}

module.exports = {
  notifyPixtrela,
  signBody,
  isNonEmptyBpedido,
};
