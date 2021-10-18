const calcQuadros = produto => {
	
	const calcQuadroEsp = quadro => {
		const revestimento = quadro.revestimento ? quadro.chapa.espessura : 0;
		quadro.espQuadro = quadro.sarrafos.espessura + revestimento;
	};

	const { partes } = produto.modelo;

	let quadros = ["lateral", "cabeceira", "tampa"];
	partes.map((parte, index) => {
		if (quadros.includes(parte.nome)) {
			calcQuadroEsp(parte);
			const calcParteFn = require(`./${parte.nome}`);
			partes[index] = calcParteFn(produto);
		}
	});
}

const calcTipoDeProduto = async produto => {

	calcQuadros(produto);
	
	const calcBase = require("./base");
	await calcBase(produto);

	const getAvulsos = require("./avulso");
	const avulsos = await getAvulsos(produto);
	produto.modelo.partes.push(...avulsos);

	const custoMP = 0;
	produto["custoMP"] = custoMP;
	const vFinal = custoMP / (1 - 0.25 - 0.07 - 0.086 - 0.12 - 0.14);
	produto["custoMO"] = vFinal * 0.25;
	produto["custoFx"] = vFinal * 0.12;
	produto["custoImp"] = vFinal * 0.086;
	produto["custoCom"] = vFinal * 0.07;
	produto["lucro"] = vFinal * 0.14;
	produto["vFinal"] = vFinal;

	const arrTrash = ["unCompra", "unVenda", "precoCompra"];
	objClean(produto, arrTrash);

	Math.roundAll10(produto, -2);

	console.log("cx-compensado/index");
	return produto;
};

module.exports = calcTipoDeProduto;
