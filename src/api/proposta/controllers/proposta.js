const ejs = require("ejs");
const path = require("path");
const puppeteer = require("puppeteer");
const axios = require("axios");
const PDFDocument = require("pdfkit");
const fs = require("fs");

module.exports = {
  async index(ctx, next) {
    // called by GET /hello
    const pedido = ctx.params.pedido;

    // console.log(result)
    const url =
      "http://localhost:1337/api/pedidos?populate=*&filters[nPedido][$eq]=" +
      pedido;
    const config = {
      method: "GET",
      url: url,
      headers: {
        'Authorization': 'Bearer 59a0a53fa5454c60afdfd86b9c3828ca763cb564fee7107ba5dedb99319e126e520c442a6fa7e2c1c845469b2a2b555ea0662508f56679d4ff4ed2d46308df0fd810097f482a28539298c0ead698d73191c7c6fafbce63be1f98acc9ff300955b7422d349b019429e4dbd5da4eb0d2a20fedff67aa4879ec62c887c2d878b100',
      },
    };

    // const response = await axios(config);
    await axios(config)
    .then(function (response) {
      console.log(JSON.stringify(response.data));
    })
    .catch(function (error) {
      console.log(error);
    });

    console.log(response.data)
    const [result] = response.data.data;
    const itenResponse = result.attributes.itens;
    const quanti = itenResponse.length;

    const Qtpages = Math.ceil(quanti / 5);

    const [resp] = response.data.data;
    const inf = resp.attributes;


    const nPedido = inf.nPedido;
    const frete = inf.frete;
    const datePop = inf.dataPedido;
    const fornecedor = inf.fornecedor.data.attributes;
    const cliente = inf.cliente;
    const condi = inf.condi;
    const itens = inf.itens;
    const prazo = inf.prazo === null ? "" : inf.prazo;
    const venc = inf.vencPedido;
    const totoalGeral = inf.totalGeral;

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

    console.log(data);

    const linkis = [];

    for (let i = 1; i <= Qtpages; i++) {
      const link = `http://localhost:1338/api/proposta/${i}`;
      linkis.push(link);
    }
    let htmls = "";
    const resphtml = linkis.map(async (l) => {
      const html = await axios(l, {
        method: "post",
        headers: {
          Authorization:
            "Bearer 59a0a53fa5454c60afdfd86b9c3828ca763cb564fee7107ba5dedb99319e126e520c442a6fa7e2c1c845469b2a2b555ea0662508f56679d4ff4ed2d46308df0fd810097f482a28539298c0ead698d73191c7c6fafbce63be1f98acc9ff300955b7422d349b019429e4dbd5da4eb0d2a20fedff67aa4879ec62c887c2d878b100",
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
      margin: {
        top: "0.4in",
        bottom: "0",
        left: "0",
        right: "0",
      },
    });
    // Gera o PDF
    const pdfBuffer = await page.pdf({
      format: "A4",
      printBackground: true,
      margin: {
        top: "0.4in",
        bottom: "0",
        left: "0",
        right: "0",
      },
    });

    await browser.close();

    const today = new Date();
    const formattedDate =
      today.getDate() +
      "_" +
      (today.getMonth() + 1) +
      "_" +
      today.getFullYear();
    const docname =
      pedido + "-" + cliente.fantasia + "-" + formattedDate + ".pdf";

    // const doc = new PDFDocument();
    // doc.pipe(fs.createWriteStream(docname));
    // doc.end(pdfBuffer);

    ctx.set("Content-Type", "application/pdf");
    ctx.set("Content-disposition", `inline;filename=${docname}`);
    ctx.body = pdf;
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
      const fornecedor = inf.fornecedor;
      const cliente = inf.cliente;
      const condi = inf.condi;
      const itens = inf.itens;
      const prazo = inf.prazo;
      const venc = inf.venc;
      const totoalGeral = inf.totoalGeral;
      const obs = inf.obs;
      const business = inf.business;

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
