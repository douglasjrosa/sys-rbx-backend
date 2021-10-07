const calcPeFn = async base => {
	const { compPe, tipos_de_pe } = base;
	let { longarina } = tipos_de_pe;

	const materiasPrimas = await strapi.services["materia-prima"].find({
		_id: { $in: [longarina] },
	});

	longarina = materiasPrimas[0];

	const pePronto = {
		comp: compPe,
		larg: longarina.largura,
		alt: longarina.espessura,
		custo: (compPe / 100) * longarina.precoVenda,
	};

	return pePronto;
};
module.exports = calcPeFn;
