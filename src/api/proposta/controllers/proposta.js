const ejs = require("ejs");
const path = require("path");

module.exports = {
  async index(ctx, next) {},

  async create(ctx, next) {
    try {
      const json = ctx.request.body;
      const page = ctx.params.page;
      const limit = 6;
      const offset = (page - 1) * limit;

      const inf = json;

      const nPedido = inf.nPedido;
      const frete = inf.frete;
      const datePop = inf.datePop;
      const fornecedor = inf.fornecedor.data;
      const cliente = inf.cliente;
      const condi = inf.condi;
      const itens = inf.itens;
      const prazo = inf.prazo;
      const venc = inf.venc;
      const totoalGeral = inf.totoalGeral;
      const obs = inf.obs;
      const business = inf.business;

      const link1 = {
        url: "https://ribermax.com.br/images/logomarca-h.webp?w=1080&q=75",
        alt: "Ribermax",
        height: "30px",
        margin: "1rem 0",
      };
      const link2 = {
        url: "https://www.braghetopaletes.com.br/images/logomarca-bragheto-escuro.png?w=1080&q=75",
        alt: "Bragheto",
        height: "55px",
        margin: "0",
      };

      const logo = fornecedor.fantasia !== "BRAGHETO PALETES" ? link1 : link2;
      const chunk = itens.slice(offset, offset + limit);

      const filePath = path.join(__dirname, "../", "lib", "pdf.ejs");
      await ejs.renderFile(
        filePath,
        {
          nPedido,
          frete,
          datePop,
          fornecedor,
          cliente,
          itens: chunk,
          condi,
          prazo,
          venc,
          totoalGeral,
          obs,
          business,
          pagina: page,
          logo,
        },
        async (err, html) => {
          if (err) {
            console.log(err);
            return "erro na leitura do arquivo";
          }
          if (html) {
            ctx.body = html;
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
