const ejs = require("ejs");
const path = require("path");
const puppeteer = require("puppeteer");
const axios = require("axios");
const pdfMerge = require("pdf-merge");
const fs = require("fs");

module.exports = {
  async index(ctx, next) {
    // called by GET /hello
    const pedido = ctx.params.pedido;
    const url =
      "http://localhost:1337/api/pedidos?populate=*&filters[nPedido][$eq]=1234";
    const config = {
      method: "GET",
      url: url,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer edf14eaee600f0b3eb9c1afe47d2119dd47018c2c8ca65b81c5e73f8cc7928f6f6ef64fb380e751d140405a5b7fb63ce1d5f622d093a9e26fd45cbe2f1d62e0b1b42b73f9bf060edea7f0e2a51a0f94c04f75b54eb11122b5849d41e55751c02864d0b5dd47311e56af35d10a55a58a7f2989bc13f6578afcb2b7028ce4dedce",
      },
    };

    const response = await axios(config);
    console.log(response.data);
    const [result] = response.data.data;
    const itenResponse = result.attributes.itens;
    const quanti = itenResponse.length;
    const Qtpages = Math.ceil(quanti / 5);

    const [resp] = response.data.data;
    const inf = resp.attributes;

    const nPedido = inf.nPedido;
    const frete = inf.frete;
    const datePop = inf.datePop;
    const fornecedor = inf.fornecedor.data.attributes;
    const cliente = inf.cliente;
    const condi = inf.condi;
    const itens = inf.itens;
    const prazo = inf.prazo === null ? "" : inf.prazo;
    const venc = inf.venc;
    const totoalGeral = inf.totoalGeral;

    const data = {
      nPedido,
      frete,
      datePop,
      fornecedor,
      cliente,
      condi,
      itens,
      prazo,
      venc,
      totoalGeral,
    };

    const linkis = [];

    for (let i = 1; i <= Qtpages; i++) {
      const link = `http://localhost:1337/api/proposta/${i}?pedido=${pedido}`;
      linkis.push(link);
    }
    let htmls = "";
    const resphtml = linkis.map(async (l) => {
      const html = await axios(l, {
        method: "post",
        headers: {
          Authorization:
            "Bearer edf14eaee600f0b3eb9c1afe47d2119dd47018c2c8ca65b81c5e73f8cc7928f6f6ef64fb380e751d140405a5b7fb63ce1d5f622d093a9e26fd45cbe2f1d62e0b1b42b73f9bf060edea7f0e2a51a0f94c04f75b54eb11122b5849d41e55751c02864d0b5dd47311e56af35d10a55a58a7f2989bc13f6578afcb2b7028ce4dedce",
        },
        data: data,
      });
      htmls += html.data;
    });

    await Promise.all(resphtml);

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    await page.setContent(htmls);

    // Gera o PDF
    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: "0",
    });

    await browser.close();

    const today = new Date();
    const formattedDate =
      today.getDate() +
      "_" +
      (today.getMonth() + 1) +
      "_" +
      today.getFullYear();
    const docname = pedido + "-" + formattedDate + ".pdf";

    ctx.set("Content-Type", "application/pdf");
    ctx.set("Content-disposition", `attachment;filename=${docname}`);
    ctx.body = pdf;
  },
  async create(ctx, next) {
    try {
      const json = ctx.request.body;
      const page = ctx.params.page;
      const limit = 5;
      const offset = (page - 1) * limit;

      const inf = json;

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
