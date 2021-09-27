const Observable = require("../utils/observers");
const { partesDataFill } = require("../utils/scripts-rbx");
const Produto = new Observable();

const calcularProduto = async req => {
	const prod = Produto.get();

	const mod = await strapi.services.modelo.findOne({
		slug: req.modelo,
	});

	prod.req = req;
	prod.tipo = mod.tipos_de_produto.slug;
	prod.mod = mod;
    Produto.set(prod);

	const tipoFn = require(`./${prod.tipo}`);
	Produto.subscribe(tipoFn);

	Produto.notify(Produto);

	return await Produto.get();
};
module.exports = calcularProduto;


/*
pe
assoalho
quadroV / quadroH
tabuleiroV / tabuleiroH
gradeadoV / gradeadoH
*/
