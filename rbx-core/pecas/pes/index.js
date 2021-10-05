const calcularPe = async (base) => {
	
	const { slug } = base.tipos_de_pe;

	const calcPeFn = require(`./${slug}`);
	const pes = await calcPeFn(base);

	return pes;
};
module.exports = calcularPe;
