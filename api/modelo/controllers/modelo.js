"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
	async tipos(ctx) {
		const response = require("../../../rbx-core/configs/tipos");

		ctx.send(response);
	},
	async simular(ctx) {
		const req = ctx.request.body;
		const calcularProduto = require("../../../rbx-core/tipos");
		const response = await calcularProduto(req);

		ctx.send(response);
	},
};
