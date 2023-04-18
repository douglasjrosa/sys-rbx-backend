const ejs = require("ejs");
const path = require("path");
const puppeteer = require("puppeteer");
const axios = require("axios");


module.exports = {
  async index(ctx, next) {

  },

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
      const logo = '';

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
          logo
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
