"use strict";

/**
 * Read the documentation (https://strapi.io/documentation/developer-docs/latest/development/backend-customization.html#core-controllers)
 * to customize this controller
 */

module.exports = {
	async simular(ctx) {
		const prodRequest = await ctx.request.body;
		const modeloObj = await strapi.services.modelo.findOne({
			slug: prodRequest.modelo,
		});

		const Modelo = await require(`./classes/${prodRequest.modelo}.js`);
		const produto = new Modelo(prodRequest);

		ctx.send(produto.calcularCx(modeloObj));
	},
};
