const calcularTampa = require("../../partes/tampa");

const calcParteFn = async (prod) => {
    const { req, mod } = prod;
    const { tampa } = mod.partes;
    
    
	const arrTrash = [ "unCompra", "unVenda", "precoCompra" ];
	objClean( tampa, arrTrash );

	const customConfigs = req.partes && req.partes.tampa ? req.partes.tampa : {};

	return await calcularTampa( {...tampa, ...customConfigs } );
}
module.exports = calcParteFn;