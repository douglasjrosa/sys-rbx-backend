const calcularBase = async base => {
	const calcPe = require("./pes");

	const pes = await calcPe(base);
	base.pes = pes;

	const calcAssoalho = require("./assoalho");
	const assoalho = calcAssoalho(base);

	const custoParte = pes.custoMP + assoalho.custoMP;

	console.log("paletes/index");
	return { nome: "base", pes, assoalho, custoParte };
};
module.exports = calcularBase;
