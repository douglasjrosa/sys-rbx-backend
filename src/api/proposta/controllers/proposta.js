const ejs = require("ejs");
const path = require("path");
const pdf = require("html-pdf");

module.exports = {
  async index(ctx, next) {
    // called by GET /hello
    ctx.body = "Hello World!"; // we could also send a JSON
  },
  async create(ctx, next) {
    try {
      const inf = {
        empresa: "01812637000145",
        periodo: "2023-02-07",
        vendedor: "alexandre vendedor",
        nPedido: "2642",
        frete: "CIP",
        datePop: "10/02/2023",
        fornecedor: {
          razao: "Renato Hugo Rosa LTDA",
          fantasia: "Renato Hugo Rosa",
          cnpj: "30.668.678/0001-08",
          end: "R. Australia, 585",
          city: "Ribeirão Preto-SP",
          tel: "(16) 99765-5543",
          email: "contato@ribermax.com.br",
        },
        cliente: {
          razao: "Renato Hugo Rosa LTDA cliente",
          fantasia: "Renato Hugo Rosa cliente",
          cnpj: "30.668.678/0001-08 cleinete",
          end: "R. Australia, 585 cleinete",
          city: "Ribeirão Preto-SP cleinete",
          tel: "(16) 99765-5543 cleinete",
          email: "contato@ribermax.com.br cleinete",
        },
        itens: [
          {
            prodId: "2923",
            modelo: "caixa_reforcada",
            nomeProd: "Caixa EXP. Argentina",
            pesoProd: "1000",
            comprimento: "120",
            largura: "120",
            altura: "120",
            ativo: "1",
            vFinal: "673,20",
            codg: "2923",
            unid: "20",
          },
          {
            prodId: "7861",
            preco: "6.244,00",
            vFinal: "4.101,00",
            ativo: "1",
            empresa: "2383",
            modelo: "caixa_reforcada",
            tabela: "0.23",
            nomeProd: "Caixa de madeira - 400 x 230 x 200",
            comprimento: "400",
            largura: "230",
            altura: "200",
            codigo: "",
            pesoProd: "",
            codg: "7861",
            unid: "54",
          },
          {
            prodId: "1249",
            modelo: "palete_sob_medida",
            nomeProd: "Palete de madeira 90 x 90",
            pesoProd: "100",
            comprimento: "90",
            largura: "90",
            ativo: "1",
            vFinal: "70,40",
            codg: "1249",
            unid: "31",
          },
          {
            prodId: "7856",
            preco: "7.491,00",
            vFinal: "4.290,00",
            ativo: "1",
            empresa: "2383",
            modelo: "caixa_reforcada",
            tabela: "0.20",
            nomeProd: "Caixa de madeira - 450 x 230 x 240",
            comprimento: "450",
            largura: "230",
            altura: "240",
            codigo: "",
            pesoProd: "",
            codg: "7856",
            unid: "20",
          },
          {
            prodId: "7858",
            preco: "7.594,00",
            vFinal: "4.349,00",
            ativo: "1",
            empresa: "2383",
            modelo: "caixa_reforcada",
            tabela: "0.20",
            nomeProd: "Caixa de madeira - 500 x 230 x 200",
            comprimento: "500",
            largura: "230",
            altura: "200",
            codigo: "",
            pesoProd: "",
            codg: "7858",
            unid: "10",
          },
        ],
        condi: "a vista",
        prazo: "",
        venc: "13/02/2023",
        totoalGeral: "R$ 5.000,00",
      };

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

      const filePath = path.join(__dirname, "../", "lib", "pdf.ejs");
      await ejs.renderFile(
        filePath,
        {
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
        },
        async (err, html) => {
          if (err) {
            console.log(err);
            return "erro na leitura do arquivo";
          }
          if (html) {
            pdf
              .create(html, { format: "A4" })
              .toFile("hello.pdf", function (err, res) {
                if (err) return console.log(err);
               return res
              });
            ctx.body = pdf;
          }
        }
      );
    } catch (err) {
      console.log(err);
      ctx.status = 500;
      ctx.body = err;
    }
  },
};
