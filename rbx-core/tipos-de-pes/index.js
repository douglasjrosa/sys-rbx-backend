const calcularPe = async (palete) => {
	
	const { slug } = palete.tipos_de_pe;

	const calcPeFn = require(`../tipos-de-pes/${slug}`);
	const pes = await calcPeFn(palete);

	return pes;
};
module.exports = calcularPe;
