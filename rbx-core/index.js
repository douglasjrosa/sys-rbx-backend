require("./utils/math-decimal");
require("./utils/scripts-rbx");

const calcularProduto = async req => {
	const mod = await strapi.services.modelo.findOne({
		slug: req.modelo,
	});

	const partesObj = {};
	for (const parte of mod.partes) {
		partesObj[parte.nome] = parte;
	}
	mod.partes = partesObj;

	const prod = { req, mod };
	
	const tipo = mod.tipos_de_produto.slug;
	const calcTipoDeProduto = require(`./tipos-de-produto/${tipo}`);
	
	const produtoPronto = await calcTipoDeProduto(prod);

	console.log("Core index executado.");
	return produtoPronto;
};
module.exports = calcularProduto;
