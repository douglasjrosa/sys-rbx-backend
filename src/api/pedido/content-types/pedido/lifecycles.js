'use strict';

const { notifyPixtrela } = require('../../services/pixtrela-webhook');

const RELEVANT_UPDATE_FIELDS = new Set([
  'Bpedido',
  'itens',
  'dataEntrega',
  'empresa',
]);

function hasRelevantUpdate(data) {
  if (!data || typeof data !== 'object') return false;
  return Object.keys(data).some((key) => RELEVANT_UPDATE_FIELDS.has(key));
}

module.exports = {
  async afterCreate(event) {
    const id = event.result?.id;
    if (!id) return;
    await notifyPixtrela(strapi, id);
  },

  async afterUpdate(event) {
    const id = event.result?.id;
    if (!id) return;
    const data = event.params?.data;
    if (!hasRelevantUpdate(data)) return;
    await notifyPixtrela(strapi, id);
  },
};
