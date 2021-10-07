const calcPeFn = async base => {
	const { compPe, tipos_de_pe } = base;
	let { longarina, pregoG } = tipos_de_pe;

	const materiasPrimas = await strapi.services["materia-prima"].find({
		_id: { $in: [longarina, pregoG] },
	});

	longarina = materiasPrimas[0];
	pregoG = materiasPrimas[1];

	pregoG.qtde = (compPe / 20 + 1) * 4;
	pregoG.custo = pregoG.qtde * pregoG.precoVenda;

	const pePronto = {
		comp: compPe,
		larg: longarina.largura,
		alt: longarina.espessura * 5,
		pregos: pregoG,
		custo: ((compPe * 5) / 100) * longarina.precoVenda + pregoG.custo
	};

	return pePronto;
};
module.exports = calcPeFn;
