const partesDataFill = require("../../../../utils/scripts-rbx");

class Economica {
	constructor(prodRequest) {
		this.info = prodRequest;
		this.partes = {
			pe: { pecas: {} },
			assoalho: { pecas: {} },
			lateral: { pecas: {} },
			cabeceira: { pecas: {} },
			tampa: { pecas: {} },
			avulso: [],
		};
	}

	calcularCx(modeloObj) {
		// Preenche na classe as medidas das peças
		// conforme as matérias primas do modelo.
		this.partes = partesDataFill(modeloObj);

        // Calcula o pé
		this.partes.pe = this.calcularPe(modeloObj);


		return this;
	}

	calcularPe(modeloObj) {
		
		const { sarrafo, toco, prego } = this.partes.pe.pecas;
		const qtde = Math.ceil(this.info.comp / modeloObj.vaoMaximoEntrePes) + 1;

		sarrafo.comp =
			this.info.larg +
			this.partes.lateral.pecas.sarrafoExt.esp * 2 +
			this.partes.lateral.pecas.chapa.esp * 2;

		if (modeloObj.peAlto) {
			if (modeloObj.peReforcado) sarrafo.qtde = 5;
			else {
				sarrafo.qtde = 2;

				toco.qtde = Math.ceil(this.info.larg / 30) + 1;
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

		return { qtde, custo, pecas: { sarrafo, toco, prego } };
	}

    calcularLateral(){

    }
}
module.exports = Economica;
