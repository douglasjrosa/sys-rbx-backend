const calcParteFn = produto => {
	const calcularQuadro = require("../../pecas/quadros");

	const { partes } = produto.modelo;
	const [base] = partes.filter(parte => parte.nome === "base");
	const [lateral] = partes.filter(parte => parte.nome === "lateral");
	const [cabeceira] = partes.filter(parte => parte.nome === "cabeceira");
	const [tampa] = partes.filter(parte => parte.nome === "tampa");

	const {
		lateraisPorFora,
		cabeceiraAoChao,
		cabeceiraAoTopo,
		temCabeceiraDireita,
		temCabeceiraEsquerda,
	} = produto.modelo;

	cabeceira.longQuadro = lateraisPorFora
		? produto.larg
		: produto.larg + lateral.espQuadro * 2;

	cabeceira.compQuadro = produto.alt + base.assoalho.espessura;
	if (cabeceiraAoChao) cabeceira.compQuadro += base.pes.pePronto.alt;
	if (cabeceiraAoTopo) cabeceira.compQuadro += tampa.espQuadro;

	let customConfigs = {};
	if (produto.custom && produto.custom.partes) {
		[customConfigs] = produto.custom.partes.filter(
			parte => parte.nome === "cabeceira"
		);
	}

	const quadro = calcularQuadro({ ...cabeceira, ...customConfigs });

	quadro.qtde = 0;
	if (temCabeceiraDireita) quadro.qtde++;
	if (temCabeceiraEsquerda) quadro.qtde++;

	quadro.custoParte = quadro.qtde * quadro.custoQuadroMP;

	return quadro;
};
module.exports = calcParteFn;
