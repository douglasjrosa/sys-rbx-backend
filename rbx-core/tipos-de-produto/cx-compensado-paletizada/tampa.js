const calcParteFn = async prod => {
	const calcularQuadro = require("../../pecas/quadros");
	const { req, mod } = prod;

	const { lateral, cabeceira, tampa } = mod.partes;

	if (mod.cabeceiraAoTopo){
		tampa.compQuadro = req.larg + lateral.espQuadro * 2;
		tampa.longQuadro = req.comp;
	}
	else{
		tampa.compQuadro = req.comp + cabeceira.espQuadro * 2;
		tampa.longQuadro = req.larg + lateral.espQuadro * 2;
	}
	
	const customConfigs =
		req.partes && req.partes.tampa ? req.partes.tampa : {};

	const quadro = await calcularQuadro({ ...tampa, ...customConfigs });

	quadro.qtde = mod.temTampa ? 1 : 0;

	quadro.custoParte = quadro.qtde * quadro.custoQuadro;

	return quadro;
};
module.exports = calcParteFn;
