const {mpDataFill} = require("../utils/scripts-rbx");

const calcularPe = prod => {
	console.log("Calculando pé com tocos...");
    return prod.req.larg;

    /*
	
    
			const { longarina, toco, pe } = parte["tipos_de_pe"];

			const longarinaMp = await strapi.services["materia-prima"].findOne({
				id: longarina,
			});
            
			Produto.set({ longarinaMp });
    
    
    
    
    
    const { sarrafo, toco, prego } = caixa.partes.pe;
	const qtde = Math.ceil(caixa.req.comp / caixa.mod.vaoMaximoEntrePes) + 1;

	sarrafo.comp =
		caixa.req.larg +
		caixa.partes.lateral.sarrafoExt.esp * 2 +
		caixa.partes.lateral.chapa.esp * 2;

	if (caixa.mod.peAlto) {
		if (caixa.mod.peReforcado) sarrafo.qtde = 5;
		else {
			sarrafo.qtde = 2;

			toco.qtde = Math.ceil(caixa.req.larg / 30) + 1;
			toco.esp = toco.esp * 3;
			toco.custo = (toco.comp / 100) * 3 * toco.qtde * toco.precoVenda;

			prego.qtde = toco.qtde * qtde * 7;
			prego.custo = prego.qtde * prego.precoVenda;
		}
	} else {
		sarrafo.qtde = 1;
		toco.qtde = 0;
	}
	sarrafo.custo = ((sarrafo.qtde * sarrafo.comp) / 100) * sarrafo.precoVenda;

	const custo = qtde * (sarrafo.custo + toco.custo + prego.custo);

	caixa.partes.pe = { qtde, custo, sarrafo, toco, prego };

	Estruturada.set(caixa);
    */
};
module.exports = calcularPe;