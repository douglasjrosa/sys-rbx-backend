
const calcParteFn = async prod => {
    const calcularCabeceira = require("../../partes/cabeceira");
    const { req, mod } = prod;
    const { cabeceira } = mod.partes;
    
	const arrTrash = [ "unCompra", "unVenda", "precoCompra" ];
	objClean( cabeceira, arrTrash );

	const customConfigs = req.partes && req.partes.cabeceira ? req.partes.cabeceira : {};

	return await calcularCabeceira( {...cabeceira, ...customConfigs } );
}
module.exports = calcParteFn;