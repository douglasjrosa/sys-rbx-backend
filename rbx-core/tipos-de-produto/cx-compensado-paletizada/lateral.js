const calcParteFn = async prod => {
	const calcularQuadro = require("../../pecas/quadros");
	const { req, mod } = prod;

	const { base, lateral, cabeceira } = mod.partes;

	const lateraisPorFora = req.lateraisPorFora
		? req.lateraisPorFora
		: mod.lateraisPorFora;
	lateral.compQuadro = lateraisPorFora
		? req.comp + cabeceira.espQuadro * 2
		: req.comp;
	lateral.longQuadro = req.alt + base.assoalho.espessura;

	const customConfigs =
		req.partes && req.partes.lateral ? req.partes.lateral : {};

	const quadro = await calcularQuadro({ ...lateral, ...customConfigs });

	quadro.qtde = 0;
	if (mod.temLateralDireita) quadro.qtde++;
	if (mod.temLateralEsquerda) quadro.qtde++;
	
	quadro.custoParte = quadro.qtde * quadro.custoQuadro;

	return quadro;
};
module.exports = calcParteFn;
