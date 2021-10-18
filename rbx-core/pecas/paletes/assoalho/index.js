const calcAssoalho = base => {
	const assoalhoObj = base.assoalho;

	const assoalho = {
		comp: assoalhoObj.comp,
		larg: assoalhoObj.larg,
		alt: assoalhoObj.espessura,
		tabuas: {
			comp: assoalhoObj.comp,
			larg: assoalhoObj.largura,
			esp: assoalhoObj.espessura,
			qtde: Math.ceil(
				assoalhoObj.larg / (assoalhoObj.largura + base.vaoMaximoEntreTabuas)
			),
			custoMP: (assoalhoObj.comp / 100) * assoalhoObj.precoVenda,
		},
		pregos: { pregoP: {}, pregoG: {} },
		custoMP: 0,
	};
	if (base.tabuasMeioQtde > -1) assoalho.tabuas.qtde = base.tabuasMeioQtde + 2;
	assoalho.custoMP = assoalho.tabuas.qtde * assoalho.tabuas.custoMP;

	const { pregoP, pregoG } = base;

	pregoP.qtde = assoalho.tabuas.qtde * base.pes.qtde * 2;
	pregoP.custoMP = pregoP.qtde * pregoP.precoVenda;
	assoalho.pregos.pregoP = pregoP;
	assoalho.custoMP += pregoP.custoMP;

	if (base.pes.pePronto.alt > 2) {
		pregoG.qtde = base.pes.qtde * 4;
		pregoG.custoMP = pregoG.qtde * pregoG.precoVenda;
		assoalho.pregos.pregoG = pregoG;
		assoalho.custoMP += pregoG.custoMP;
	}

	return assoalho;
};
module.exports = calcAssoalho;
