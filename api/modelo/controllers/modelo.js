"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
	async simular(ctx) {

			const calcularProduto = require("../../../rbx-core/tipos-de-produto");
			
			const req = ctx.request.body;
			const produtoPronto = await calcularProduto(req);
			
			console.log("enviando resposta...");
			ctx.send(produtoPronto);
	},
};
