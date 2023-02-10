const ejs = require("ejs");
const path = require("path");
const fs = require("fs");

async function PdfGenerator(inf) {

  const nPedido = inf.nPedido;
  const frete = inf.frete;
  const datePop = inf.datePop;
  const fornecedor = inf.fornecedor;
  const cliente = inf.cliente;
  const condi = inf.condi;
  const itens = inf.itens;
  const prazo = inf.prazo;
  const venc = inf.venc;
  const totoalGeral = inf.totoalGeral;

  const filePath = path.join(__dirname, "pdf.ejs");
  ejs.renderFile(filePath, {
    nPedido,
    frete,
    datePop,
    fornecedor,
    cliente,
    itens,
    condi,
    prazo,
    venc,
    totoalGeral,
  }, (err,data)=>{
    if (err){
      console.log(err);
      return 'erro na leitura do arquivo';
    }
    if (data) {
      fs.writeFile('pdf1.pdf', data, (err) => {
        if (err) throw err;
        console.log('The file has been saved!');
      });
    }

  });
}

module.exports =  PdfGenerator()
