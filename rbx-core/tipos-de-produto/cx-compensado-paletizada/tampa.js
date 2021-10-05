const calcularTampa = require("../../partes/tampa");

const calcParteFn = async (prod) => {
    const { req, mod } = prod;
    const { tampa } = mod.partes;
    
    return await calcularTampa(tampa);
}
module.exports = calcParteFn;