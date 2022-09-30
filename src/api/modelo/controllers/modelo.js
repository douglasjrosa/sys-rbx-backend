"use strict";

/**
 * modelo controller
 */

const { createCoreController } = require("@strapi/strapi").factories;
const calcularProduto = require("../../../../rbx-core");

module.exports = createCoreController("api::modelo.modelo", ({ strapi }) => ({
  async simular(ctx) {
    const req = ctx.request.body;
    const produtoPronto = await calcularProduto(req);
    console.log("enviando resposta...");
    try {
      ctx.send = produtoPronto;
    } catch (err) {
      ctx.send = err;
    }
  },
}));
