const calcularBase = require("../../partes/base");

const calcParteFn = async prod => {
    const { req, mod } = prod;
    const { base } = mod.partes;
    base.assoalho.comp = req.comp;
    base.assoalho.larg = req.larg;
    base.compPe = req.larg;
    base.longPe = req.comp;

	const arrTrash = [ "unCompra", "unVenda", "precoCompra" ];
	objClean( base, arrTrash );
    
	const customConfigs = req.partes && req.partes.base ? req.partes.base : {};
    
    return await calcularBase( { ...base, ...customConfigs } );
}
module.exports = calcParteFn;