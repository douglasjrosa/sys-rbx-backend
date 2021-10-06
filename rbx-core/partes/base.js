
const calcularBase = async base => {
    
    const calcularPe = require("../pecas/pes");
    const pes = await calcularPe( base );
    
    const assoalhoObj = base.assoalho;

    const assoalho = {
        comp: assoalhoObj.comp,
        larg: assoalhoObj.larg,
        custo: 0,
        tabuas : {
            comp: assoalhoObj.comp,
            larg: assoalhoObj.largura,
            esp: assoalhoObj.espessura,
            custo: Math.ceil10( assoalhoObj.comp / 100 * assoalhoObj.precoVenda, -2),
            qtde: Math.ceil(assoalhoObj.larg / ( assoalhoObj.largura + base.vaoMaximoEntreTabuas ))
        }
    };
    assoalho.custo = Math.ceil10(assoalho.tabuas.qtde * assoalho.tabuas.custo, -2);

    base.assoalho = assoalho;
    base.pes = pes;
    
    return base;
}
module.exports = calcularBase;