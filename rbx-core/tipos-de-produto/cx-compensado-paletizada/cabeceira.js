const calcParteFn = async prod => {
	const calcularQuadro = require("../../pecas/quadros");
	const { req, mod } = prod;

	const { base, lateral, cabeceira, tampa } = mod.partes;

	const lateraisPorFora = req.lateraisPorFora
		? req.lateraisPorFora
		: mod.lateraisPorFora;

	cabeceira.longQuadro = lateraisPorFora
		? req.larg
		: req.larg + lateral.espQuadro * 2;

	cabeceira.compQuadro = req.alt + base.assoalho.espessura;
	if (mod.cabeceiraAoChao) cabeceira.compQuadro += base.pes.pePronto.alt;
	if (mod.cabeceiraAoTopo) cabeceira.compQuadro += tampa.espQuadro;

	const customConfigs =
		req.partes && req.partes.cabeceira ? req.partes.cabeceira : {};

	const quadro = await calcularQuadro({ ...cabeceira, ...customConfigs });

	quadro.qtde = 0;
	if (mod.temCabeceiraDireita) quadro.qtde++;
	if (mod.temCabeceiraEsquerda) quadro.qtde++;

	quadro.custoParte = quadro.qtde * quadro.custoQuadro;

	return quadro;
};
module.exports = calcParteFn;
