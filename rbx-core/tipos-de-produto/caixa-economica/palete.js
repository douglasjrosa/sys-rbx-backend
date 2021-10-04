const calcularPalete = require("../../partes/palete");

const calcParteFn = async (prod) => {
    const { req, mod } = prod;
    const { palete } = mod.partes;
    palete.assoalho.comp = req.comp;
    palete.assoalho.larg = req.larg;
    palete.compPe = req.larg;
    palete.longPe = req.comp;
    
    return await calcularPalete(palete);
}
module.exports = calcParteFn;