const palete = async Produto => {
	const prod = Produto.get();
	prod.mod.partes.map(async parte => {
		if (parte["tipos_de_pe"]) {
			const tipo_de_pe = parte["tipos_de_pe"].slug;
			const calcularPe = require(`../tipos-de-pes/${tipo_de_pe}`);
			const pe = calcularPe(prod);
			Produto.set({ pe });
		}
	});
};

module.exports = palete;
