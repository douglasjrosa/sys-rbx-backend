const calcTipoDeProduto = async prod => {

	let calcParteFn;
	for( const parte in prod.partes ){
		calcParteFn = require(`./${parte}`);
		prod.partes[parte] = await calcParteFn(prod);
	}

	console.log("Calculada a caixa econômica.");
	return prod;
};

module.exports = calcTipoDeProduto;
