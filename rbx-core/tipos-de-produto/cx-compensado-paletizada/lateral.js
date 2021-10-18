const calcParteFn = produto => {
	const calcularQuadro = require("../../pecas/quadros");

	const { partes } = produto.modelo;
	const [base] = partes.filter(parte => parte.nome === "base");
	const [lateral] = partes.filter(parte => parte.nome === "lateral");
	const [cabeceira] = partes.filter(parte => parte.nome === "cabeceira");

	const { lateraisPorFora, temLateralDireita, temLateralEsquerda } =
		produto.modelo;

	lateral.compQuadro = lateraisPorFora
		? produto.comp + cabeceira.espQuadro * 2
		: produto.comp;

	lateral.longQuadro = produto.alt + base.assoalho.espessura;

	let customConfigs = {};
	if (produto.custom && produto.custom.partes) {
		[customConfigs] = produto.custom.partes.filter(
			parte => parte.nome === "lateral"
		);
	}
	const quadro = calcularQuadro({ ...lateral, ...customConfigs });

	quadro.qtde = 0;
	if (temLateralDireita) quadro.qtde++;
	if (temLateralEsquerda) quadro.qtde++;

	quadro.custoParte = quadro.qtde * quadro.custoQuadroMP;

	return quadro;
};
module.exports = calcParteFn;
