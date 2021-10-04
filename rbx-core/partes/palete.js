const calcularPe = require("../tipos-de-pes");

const calcularPalete = async (palete) => {
    
    const pes = await calcularPe( palete );
    
    const assObj = palete.assoalho;

    const assoalho = {
        comp: assObj.comp,
        larg: assObj.larg,
        vaoMaximoEntreTabuas: palete.vaoMaximoEntreTabuas,
        custo: 0,
        tabuas : {
            comp: assObj.comp,
            larg: assObj.largura,
            esp: assObj.espessura,
            custo: Math.ceil10( assObj.comp / 100 * assObj.precoVenda, -2),
            qtde: Math.ceil(assObj.larg / ( assObj.largura + palete.vaoMaximoEntreTabuas ))
        }
    };
    assoalho.custo = Math.ceil10(assoalho.tabuas.qtde * assoalho.tabuas.custo, -2);
    
    return { pes, assoalho };
}
module.exports = calcularPalete;