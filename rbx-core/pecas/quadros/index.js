const calcExterno = quadro => {
	const externo = {
		comp: quadro.compQuadro,
		larg: quadro.sarrafos.largura,
		esp: quadro.sarrafos.espessura,
		qtde: 2,
		custoMP: 0,
	};
	externo.custoMP =
		(externo.comp / 100) * quadro.sarrafos.precoVenda * externo.qtde;

	return externo;
};

const calcInterno = quadro => {
	const interno = {
		comp: quadro.longQuadro - quadro.sarrafos.largura * 2,
		larg: quadro.sarrafos.largura,
		esp: quadro.sarrafos.espessura,
		qtde: 2,
		custoMP: 0,
	};
	interno.custoMP =
		(interno.comp / 100) * quadro.sarrafos.precoVenda * interno.qtde;

	return interno;
};

const calcMeio = quadro => {
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

	qtdeMeio = longMeio > quadro.sarrafos.largura * 8 ? Math.max(qtdeMeio, 1) : 0;

	const meio = {
		comp: compMeio,
		larg: quadro.sarrafos.largura,
		esp: quadro.sarrafos.espessura,
		qtde: qtdeMeio,
		custoMP: 0,
	};
	meio.custoMP = (meio.comp / 100) * quadro.sarrafos.precoVenda * meio.qtde;

	return meio;
};

const calcChapa = quadro => {
	let chapa = {};
	if (quadro.revestimento) {
		chapa = {
			comp: quadro.compQuadro,
			larg: quadro.longQuadro,
			esp: quadro.chapa.espessura,
			qtde: quadro.revestimento ? 1 : 0,
			custoMP: 0,
		};
		chapa.custoMP =
			(chapa.comp / 100) *
			(chapa.larg / 100) *
			chapa.qtde *
			quadro.chapa.precoVenda;
	}
	return chapa;
};

const calcFixadores = (quadro, externo, interno, meio) => {
	
	let fixQuadroQtde = (interno.qtde + meio.qtde) * 2 * 1.7;

	let fixChapaQtde = 0;
	if (quadro.revestimento) {
		fixChapaQtde += externo.comp * externo.qtde;
		fixChapaQtde += interno.comp * interno.qtde;
		fixChapaQtde += meio.comp * meio.qtde;
		fixChapaQtde *= 0.11;
	}
	else fixQuadroQtde *= 2;

	const fixadores = {
		nome: quadro.fixadores.nome,
		qtde: fixQuadroQtde + fixChapaQtde,
		custoMP: (fixQuadroQtde + fixChapaQtde) * quadro.fixadores.precoVenda,
	};
	return fixadores;
};

const calcularQuadro = quadro => {
	
	const externo = calcExterno(quadro);
	const interno = calcInterno(quadro);
	const meio = calcMeio(quadro);

	const chapa = calcChapa(quadro);
	const fixadores = calcFixadores(quadro, externo, interno, meio);

	delete quadro.sarrafos;
	delete quadro.chapa;
	delete quadro.fixadores;
	
	let quadroPronto = {
		sarrafos: { externo, interno, meio },
		chapa,
		fixadores
	};
	quadroPronto = objMerge(quadroPronto, quadro.quadroPronto);

	let custoQuadroMP = 0;
	custoQuadroMP += externo.custoMP ? externo.custoMP : 0;
	custoQuadroMP += interno.custoMP ? interno.custoMP : 0;
	custoQuadroMP += meio.custoMP ? meio.custoMP : 0;
	custoQuadroMP += chapa.custoMP ? chapa.custoMP : 0;
	custoQuadroMP += fixadores.custoMP ? fixadores.custoMP : 0;

	console.log("retornando quadro...");
	return { ...quadro, quadroPronto, custoQuadroMP };
};
module.exports = calcularQuadro;
