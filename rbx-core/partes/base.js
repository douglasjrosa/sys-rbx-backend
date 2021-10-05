
const calcularBase = async base => {
    
    const calcularPe = require("../pecas/pes");
    const pes = await calcularPe( base );
    
    const assObj = base.assoalho;

    const assoalho = {
        comp: assObj.comp,
        larg: assObj.larg,
        vaoMaximoEntreTabuas: base.vaoMaximoEntreTabuas,
        custo: 0,
        tabuas : {
            comp: assObj.comp,
            larg: assObj.largura,
            esp: assObj.espessura,
            custo: Math.ceil10( assObj.comp / 100 * assObj.precoVenda, -2),
            qtde: Math.ceil(assObj.larg / ( assObj.largura + base.vaoMaximoEntreTabuas ))
        }
    };
    assoalho.custo = Math.ceil10(assoalho.tabuas.qtde * assoalho.tabuas.custo, -2);
    
    return { pes, assoalho };
}
module.exports = calcularBase;