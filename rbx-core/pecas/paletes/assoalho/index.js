const calcAssoalho = base => {
    const assoalhoObj = base.assoalho;
    
    
    const assoalho = {
        comp: assoalhoObj.comp,
        larg: assoalhoObj.larg,
        alt: assoalhoObj.espessura,
        tabuas : {
            comp: assoalhoObj.comp,
            larg: assoalhoObj.largura,
            esp: assoalhoObj.espessura,
            qtde: Math.ceil(assoalhoObj.larg / ( assoalhoObj.largura + base.vaoMaximoEntreTabuas )),
            custo: assoalhoObj.comp / 100 * assoalhoObj.precoVenda
        },
        pregos: { pregoP: {}, pregoG: {} },
        custo: 0
    };
    assoalho.custo = assoalho.tabuas.qtde * assoalho.tabuas.custo;
    
    const { pregoP, pregoG } = base;

    pregoP.qtde = assoalho.tabuas.qtde * base.pes.qtde * 2;
    pregoP.custo = pregoP.qtde * pregoP.precoVenda;
    assoalho.pregos.pregoP = pregoP;
    assoalho.custo += pregoP.custo
    
    if(base.pes.pePronto.alt > 2){
        pregoG.qtde = base.pes.qtde * 4;
        pregoG.custo = pregoG.qtde * pregoG.precoVenda;
        assoalho.pregos.pregoG = pregoG;
        assoalho.custo += pregoG.custo;
    }

    return assoalho;
}
module.exports = calcAssoalho;