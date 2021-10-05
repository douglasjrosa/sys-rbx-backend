const calcularAvulso = require("../../partes/avulso");

const calcParteFn = async (prod) => {
    const { req, mod } = prod;
    const { avulso } = mod.partes;
    
    return await calcularAvulso(avulso);
}
module.exports = calcParteFn;