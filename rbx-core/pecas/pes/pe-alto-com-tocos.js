const calcPeFn = async (palete) => {
	
	const { compPe, longPe, vaoMaximoEntrePes, tipos_de_pe } = palete;
	const { longarina } = tipos_de_pe;

	const materiasPrimas = await strapi.services["materia-prima"].find({
		_id: { $in: [longarina] },
	});

	const longarinaMp = materiasPrimas[0];

	const tocoPronto = {
		qtde: Math.max(Math.ceil(compPe / 30), 2),
		comp: 15,
		larg: longarinaMp.largura,
		alt: Math.ceil10(longarinaMp.espessura * 3, -2),
		custo: 0,
	};

	tocoPronto.custo = Math.ceil10(
		(tocoPronto.comp / 100) * 3 * longarinaMp.precoVenda, -2
	);

	const pePronto = {
		comp: compPe,
		larg: longarinaMp.largura,
		alt: longarinaMp.espessura * 2 + tocoPronto.alt,
		custo: Math.ceil10(
			((compPe * 2 + tocoPronto.comp * 3 * tocoPronto.qtde) / 100) *
			longarinaMp.precoVenda, -2
		),
		toco: tocoPronto,
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
