const calcParteFn = produto => {
	const calcularQuadro = require("../../pecas/quadros");

	const { partes } = produto.modelo;
	const [lateral] = partes.filter(parte => parte.nome === "lateral");
	const [cabeceira] = partes.filter(parte => parte.nome === "cabeceira");
	const [tampa] = partes.filter(parte => parte.nome === "tampa");

	const { cabeceiraAoTopo, temTampa } = produto.modelo;

	if (cabeceiraAoTopo) {
		tampa.compQuadro = produto.larg + lateral.espQuadro * 2;
		tampa.longQuadro = produto.comp;
	} else {
		tampa.compQuadro = produto.comp + cabeceira.espQuadro * 2;
		tampa.longQuadro = produto.larg + lateral.espQuadro * 2;
	}

	let customConfigs = {};
	if (produto.custom && produto.custom.partes) {
		[customConfigs] = produto.custom.partes.filter(
			parte => parte.nome === "tampa"
		);
	}

	const quadro = calcularQuadro({ ...tampa, ...customConfigs });

	quadro.qtde = temTampa ? 1 : 0;

	quadro.custoParte = quadro.qtde * quadro.custoQuadroMP;

	return quadro;
};
module.exports = calcParteFn;
