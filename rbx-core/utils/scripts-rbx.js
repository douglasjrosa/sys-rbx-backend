function partesDataFill(mod) {
	const partes = {};
	["pe", "assoalho", "lateral", "cabeceira", "tampa"].map(parte => {
		partes[parte] = mpDataFill(mod[parte].pecas);
	});
	return partes;
}

function mpDataFill(pecas) {
	const filledPecas = {};
	pecas.map(peca => {
		filledPecas[peca.nome] = {
			comp: peca.comp || peca.materia_prima.comprimento,
			larg: peca.larg || peca.materia_prima.largura,
			esp: peca.esp || peca.materia_prima.espessura,
			precoVenda: peca.precoVenda || peca.materia_prima.precoVenda,
			qtde: peca.qtde,
			custo: peca.custo,
		};
	});
	return filledPecas;
}

module.exports = { partesDataFill, mpDataFill };
