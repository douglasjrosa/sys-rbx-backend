const calcTipoDeProduto = async prod => {
	
	const calcQuadroEsp =  quadro => {
		quadro.espQuadro = quadro.sarrafos.espessura + quadro.chapa.espessura;
	};

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
	
	const arrTrash = ["unCompra", "unVenda", "precoCompra"];
	objClean(response, arrTrash);

	Math.roundAll10(response, -2);
	
	console.log("Retornando caixa de compensado...");
	return response;
};

module.exports = calcTipoDeProduto;
