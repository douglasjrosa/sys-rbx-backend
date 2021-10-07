const calcularAvulso = require("../../partes/avulso");

const calcParteFn = async prod => {
    const { req, mod } = prod;
    const { avulso } = mod.partes;

	const customConfigs = req.partes && req.partes.avulso ? req.partes.avulso : {};

	return await calcularAvulso( {...avulso, ...customConfigs } );
}
module.exports = calcParteFn;