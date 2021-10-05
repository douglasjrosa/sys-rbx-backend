const calcPeFn = async (palete) => {
	
	const { compPe, longPe, vaoMaximoEntrePes, tipos_de_pe } = palete;
	const { longarina } = tipos_de_pe;

	const materiasPrimas = await strapi.services["materia-prima"].find({
		_id: { $in: [longarina] },
	});

	const longarinaMp = materiasPrimas[0];

	const pePronto = {
		comp: compPe,
		larg: longarinaMp.largura,
		alt: longarinaMp.espessura * 5,
		custo: Math.ceil10(
			compPe * 5 / 100 * longarinaMp.precoVenda, -2
		)
	};

	const pes = {
		pePronto,
		qtde: Math.max(Math.ceil( longPe / vaoMaximoEntrePes) + 1, 2),
		custo: 0
	};
	pes.custo = Math.ceil10( pes.qtde * pePronto.custo, -2);

	console.log("calculado o pé.");
	return pes;
};
module.exports = calcPeFn;
