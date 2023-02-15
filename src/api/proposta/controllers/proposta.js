const ejs = require("ejs");
const path = require("path");
const puppeteer = require("puppeteer");
const axios = require("axios");

module.exports = {
  async index(ctx, next) {
    // called by GET /hello
    const pedido = ctx.params.pedido;
    const url =
      "http://localhost:1337/api/pedidos?populate=*&filters[nPedido][$eq]=" +
      pedido;
    const config = {
      method: "GET",
      url: url,
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Bearer a9caa9967b1dbfb901d6d7481c267244d7502cc8acbea07083e6f2d7c05ce3bb936fff6d001b7fed8256b89ade8daffed9d9a3b6308c4afd204ffb76942be602e6b2314dc98bcb7a48b23111c726d12fca8cdcaef51116be1bbfd915ea495789321ee935afc53faf43d210dc8a80f5e1520804d8e903aa14a67edb05f32c0dcf",
      },
    };

    const response = await axios(config);
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

    // console.log(data);

    const linkis = [];

    for (let i = 1; i <= Qtpages; i++) {
      const link = `http://localhost:1337/api/proposta/${i}`;
      linkis.push(link);
    }
    let htmls = "";
    const resphtml = linkis.map(async (l) => {
      const html = await axios(l, {
        method: "post",
        headers: {
          Authorization:
            "Bearer a9caa9967b1dbfb901d6d7481c267244d7502cc8acbea07083e6f2d7c05ce3bb936fff6d001b7fed8256b89ade8daffed9d9a3b6308c4afd204ffb76942be602e6b2314dc98bcb7a48b23111c726d12fca8cdcaef51116be1bbfd915ea495789321ee935afc53faf43d210dc8a80f5e1520804d8e903aa14a67edb05f32c0dcf",
        },
        data: data,
      });
      htmls += html.data;
    });

    await Promise.all(resphtml);

    const browser = await puppeteer.launch();
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
