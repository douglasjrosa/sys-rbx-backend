require("./utils/math-decimal");
require("./utils/scripts-rbx");

const calcularProduto = async produto => {
	if (typeof produto.modelo === "string") {
		produto.modelo = await strapi.services.modelo.findOne({
			id: produto.modelo,
		});
	}
	
	if( typeof produto.modelo.tipos_de_produto === "string" ){
		produto.modelo.tipos_de_produto = await strapi.services["tipos-de-produto"].findOne({
			id: produto.modelo.tipos_de_produto,
		})
	}

	const calcTipoDeProduto = require(`./tipos-de-produto/${produto.modelo.tipos_de_produto.slug}`);

	const produtoPronto = await calcTipoDeProduto(produto);

	console.log("rbx-core/index");
	return produtoPronto;
};
module.exports = calcularProduto;
