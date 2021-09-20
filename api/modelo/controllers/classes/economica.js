
class Economica {
    constructor(prodRequest, modeloObj) {
        this.info = prodRequest;
        this.mod = modeloObj;
    }

    mpDataFill(pecas) {
        const obj = {}
        pecas.map(peca => {
            obj[peca.nome] = {
                comp: 0,
                larg: peca.materia_prima.largura,
                esp: peca.materia_prima.espessura,
                precoVenda: peca.materia_prima.precoVenda,
                qtde: 0,
                custo: 0
            }
        });
        return obj;
    }

    calcular() {

        const pe = {};
        pe.qtde = Math.ceil( this.info.comp / this.mod.vaoMaximoEntrePes ) + 1;
        
        pe.pecas = this.mpDataFill(this.mod.pe.pecas)

        if( this.mod.peAlto ){
            if( this.mod.peReforcado ) pe.pecas.sarrafo.qtde = 5;
            else{
                pe.pecas.sarrafo.qtde = 2;

                pe.pecas.toco.qtde = Math.ceil(this.info.larg / 30) + 1;
                pe.pecas.toco.esp = pe.pecas.toco.esp * 3;
                pe.pecas.toco.comp = 15;
                pe.pecas.toco.custo = 0.15 * 3 * pe.pecas.toco.qtde * pe.pecas.toco.precoVenda;

                pe.pecas.prego.qtde = pe.pecas.toco.qtde / 3 * pe.qtde * 7;
                pe.pecas.prego.custo = pe.pecas.prego.qtde * pe.pecas.prego.precoVenda;
            }
        }
        else{
            pe.pecas.sarrafo.qtde = 1
            pe.pecas.toco.qtde = 0
        }


        this.info.pesoProd = 0.00;
        this.info.preco = 0.00;
	    this.info.desconto = "6147758e7d4ddf1354db3600";
	    this.info.vFinal = 0.00;

        return pe;
    }
  }

module.exports = Economica;