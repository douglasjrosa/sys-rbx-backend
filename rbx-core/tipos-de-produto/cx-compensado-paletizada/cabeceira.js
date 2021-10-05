
const calcParteFn = async prod => {
    const calcularCabeceira = require("../../partes/cabeceira");
    const { req, mod } = prod;
    const { cabeceira } = mod.partes;
    
    return await calcularCabeceira(cabeceira);
}
module.exports = calcParteFn;