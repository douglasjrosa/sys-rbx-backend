
const calcTipoDeProduto = async prod => {

	let calcParteFn;
	for( const parte in prod.partes ){
		calcParteFn = require(`./${parte}`);
		prod.partes[parte] = await calcParteFn(prod);
	}

	console.log("Calculado o palete sob medida.");
	return prod;
};

module.exports = calcTipoDeProduto;