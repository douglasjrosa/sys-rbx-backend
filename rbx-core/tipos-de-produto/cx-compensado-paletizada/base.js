const calcBase = async produto => {
	const calcularBase = require("../../pecas/paletes");

	const { partes, cabeceiraAoChao } = produto.modelo;
	const [lateral] = partes.filter(parte => parte.nome === "lateral");
	const [cabeceira] = partes.filter(parte => parte.nome === "cabeceira");

	let baseIndex;
	const [base] = partes.filter((parte, index) => {
		if (parte.nome === "base") {
			baseIndex = index;
			return true;
		}
	});

	base.assoalho.comp = produto.comp;
	base.assoalho.larg = produto.larg;
	base.compPe = produto.larg + lateral.espQuadro * 2;
	base.longPe = cabeceiraAoChao
		? produto.comp
		: produto.comp + cabeceira.espQuadro * 2;

	let customConfigs = {};
    if( produto.custom && produto.custom.partes ){
        [customConfigs] = produto.custom.partes.filter(parte => parte.nome === "base")
    }

    partes[baseIndex] = await calcularBase({ ...base, ...customConfigs });

	console.log("cx-compensado/base");
};
module.exports = calcBase;
