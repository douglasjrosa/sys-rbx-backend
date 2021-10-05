const calcParteFn = async prod => {
	const calcularLateral = require("../../partes/lateral");
	const { req, mod } = prod;

	const { lateral } = mod.partes;

	const arrTrash = [ "unCompra", "unVenda", "precoCompra" ];
	objClean( lateral, arrTrash );

	const customConfigs = req.partes && req.partes.lateral ? req.partes.lateral : {};

	return await calcularLateral( {...lateral, ...customConfigs } );
};
module.exports = calcParteFn;
