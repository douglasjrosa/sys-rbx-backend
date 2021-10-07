const calcularBase = async base => {
	const calcPe = require("./pes");
	base.pes = await calcPe(base);

	const calcAssoalho = require("./assoalho");
	const assoalho = calcAssoalho(base);

	const custoParte = base.pes.custo + assoalho.custo;

	return { pes: base.pes, assoalho, custoParte };
};
module.exports = calcularBase;
