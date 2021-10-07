const calcularBase = require("../../pecas/paletes");

const calcParteFn = async prod => {
    const { req, mod } = prod;
    const { base, lateral, cabeceira } = mod.partes;
    base.assoalho.comp = req.comp;
    base.assoalho.larg = req.larg;
    base.compPe = req.larg + lateral.espQuadro * 2;
    base.longPe = mod.cabeceiraAoChao
        ? req.comp
        : req.comp + cabeceira.espQuadro * 2;
    
	const customConfigs = req.partes && req.partes.base ? req.partes.base : {};
    
    return await calcularBase( { ...base, ...customConfigs } );
}
module.exports = calcParteFn;