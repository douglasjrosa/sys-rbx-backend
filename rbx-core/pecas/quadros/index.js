const calcularQuadro = async quadro => {
	const externo = {
		comp: quadro.compQuadro,
		larg: quadro.sarrafos.largura,
		esp: quadro.sarrafos.espessura,
		qtde: 2,
		custo: 0,
	};
	externo.custo =
		(externo.comp / 100) * quadro.sarrafos.precoVenda * externo.qtde;

	const interno = {
		comp: quadro.longQuadro - quadro.sarrafos.largura * 2,
		larg: quadro.sarrafos.largura,
		esp: quadro.sarrafos.espessura,
		qtde: 2,
		custo: 0,
	};
	interno.custo =
		(interno.comp / 100) * quadro.sarrafos.precoVenda * interno.qtde;

	quadro.meioInvertido = 
		quadro.meioInvertido === "automatico"
		? quadro.longQuadro > quadro.compQuadro + 20
		: quadro.meioInvertido === "sim";

	let compMeio, longMeio, qtdeMeio;
	if (quadro.meioInvertido) {
		compMeio = quadro.compQuadro;
		longMeio = quadro.longQuadro;
	} else {
		compMeio = quadro.longQuadro;
		longMeio = quadro.compQuadro;
	}
	compMeio -= quadro.sarrafos.largura * 2;
	longMeio -= quadro.sarrafos.largura * 2;

	qtdeMeio =
		quadro.sarrafosMeioQtde !== -1
			? quadro.sarrafosMeioQtde
			: Math.ceil(longMeio / quadro.vaoMaximoEntreSarrafos) - 1;

	qtdeMeio = longMeio >  quadro.sarrafos.largura * 8
		? Math.max(qtdeMeio, 1) : 0;

	const meio = {
		comp: compMeio,
		larg: quadro.sarrafos.largura,
		esp: quadro.sarrafos.espessura,
		qtde: qtdeMeio,
		custo: 0,
	};
	meio.custo = (meio.comp / 100) * quadro.sarrafos.precoVenda * meio.qtde;

	const chapa = {
		comp: quadro.compQuadro,
		larg: quadro.longQuadro,
		esp: quadro.chapa.espessura,
		qtde: quadro.revestimento ? 1 : 0,
		custo: 0,
	};
	chapa.custo =
		(chapa.comp / 100) *
		(chapa.larg / 100) *
		chapa.qtde *
		quadro.chapa.precoVenda;

	let fixChapaQtde = 0;
	if (quadro.revestimento) {
		fixChapaQtde += externo.comp * externo.qtde;
		fixChapaQtde += interno.comp * interno.qtde;
		fixChapaQtde += meio.comp * meio.qtde;
		fixChapaQtde *= 0.11;
	}

	const fixQuadroQtde = (interno.qtde + meio.qtde) * 2 * 1.7;

	const fixadores = {
		nome: quadro.fixadores.nome,
		qtde: fixChapaQtde,
		custo: (fixQuadroQtde + fixChapaQtde) * quadro.fixadores.precoVenda,
	};

	const quadroPronto = {
		sarrafos: { externo, interno, meio },
		chapa,
		fixadores,
	};

	delete quadro.sarrafos;
	delete quadro.chapa;
	delete quadro.fixadores;

	const custoQuadro =
		externo.custo + interno.custo + meio.custo + chapa.custo + fixadores.custo;

	console.log("retornando quadro...");
	return { ...quadro, quadroPronto, custoQuadro };
};
module.exports = calcularQuadro;
