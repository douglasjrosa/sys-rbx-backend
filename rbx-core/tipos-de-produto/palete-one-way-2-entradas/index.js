
const calcTipoDeProduto = async prod => {

	const info = { ...prod.req };
	delete info.partes;
	const response = { info, partes: {} };

	let calcParteFn;
	for( const parte in prod.mod.partes ){
		calcParteFn = require(`./${parte}`);
		response.partes[parte] = await calcParteFn(prod);
	}

	const arrTrash = ["unCompra", "unVenda", "precoCompra"];
	objClean(response, arrTrash);
	
	Math.roundAll10(response, -2);

	console.log("Enviando somente o palete...");
	return response;
};

module.exports = calcTipoDeProduto;