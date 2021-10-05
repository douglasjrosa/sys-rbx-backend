const calcularBase = require("../../partes/base");

const calcParteFn = async (prod) => {
    const { req, mod } = prod;
    const { base } = mod.partes;
    base.assoalho.comp = req.comp;
    base.assoalho.larg = req.larg;
    base.compPe = req.larg;
    base.longPe = req.comp;
    
    return await calcularBase(base);
}
module.exports = calcParteFn;