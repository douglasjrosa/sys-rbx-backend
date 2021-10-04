require("../utils/math-decimal");

const calcularProduto = async req => {
	const mod = await strapi.services.modelo.findOne({
		slug: req.modelo,
	});

    const partes = {};
	const modPartes = {};
	for ( const parte of mod.partes ){
		modPartes[parte.nome] = parte;
        partes[parte.nome] = {};
	};
	
	const prod = {
		req,
		mod: {
			nome: mod.nome,
			ativo: mod.ativo,
			slug: mod.slug,
			notas: mod.notas,
			partes: modPartes
		},
		partes
	};

	const tipo = mod.tipos_de_produto.slug;
	const calcTipoDeProduto = require(`./${tipo}`);

	const produtoPronto = await calcTipoDeProduto(prod);

	console.log("index executado.");
	return produtoPronto;
};
module.exports = calcularProduto;
