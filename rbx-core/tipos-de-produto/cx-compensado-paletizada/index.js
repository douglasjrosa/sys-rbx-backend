const calcTipoDeProduto = async prod => {
	const quadros = ["lateral", "cabeceira", "tampa"];
	for (const parte in prod.mod.partes) {
		if (quadros.includes(parte)) {
			calcQuadroEsp(prod.mod.partes[parte]);
		}
	}

	const info = { ...prod.req };
	delete info.partes;
	const response = { info, partes: {} };
	
	let calcParteFn;
	for (const parte in prod.mod.partes) {
		calcParteFn = require(`./${parte}`);
		response.partes[parte] = await calcParteFn(prod);
	}

	console.log("Calculada a caixa econômica.");
	return response;
};

module.exports = calcTipoDeProduto;
