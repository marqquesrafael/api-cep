const express = require("express");
require("dotenv").config();
const puppeteer = require("puppeteer");

const app = express();

app.get("/BuscarCep/:cep", async (req, res) => {

  try {
  var cep = req.params.cep;
  
  var dados = await run(cep);
  
  return res.json(dados);
  
} catch (error) {
  console.log(error)
  return res.sendStatus(500)
}

});

app.get("/", async (req, res) => {
res.sendStatus(200);
});

async function run(cep) {
  const browser = await puppeteer.launch({args:[
    "--no-sandbox", "--disable-setuid-sandbox"
  ]});
  const page = await browser.newPage();

  await page.goto(
    "https://buscacepinter.correios.com.br/app/endereco/index.php"
  );
  await page.type("#endereco", cep);
  await page.click("#btn_pesquisar");

    await page.waitForSelector("tbody tr");

  const data = await page.evaluate(() => {
    var rows = [...document.querySelectorAll("tbody tr")]; // spreed operator remove o pai tbody e espalha os tr's em uma lista
    rows = rows.map((item) => [...item.children]); // extrai os td's da minha tr
    // rows =  rows.map((item) => [...item.querySelectorAll("td")]); // faz a mesma coisa da linha de cima

    return rows.map((item) => ({
      logradouro: item[0].innerText,
      bairo: item[1].innerText,
      localidade: item[2].innerText,
      cep: item[3].innerText,
    }));
  });

  browser.close();

  return data;
}

app.get("/BuscarCep", function (req, res) {
  req.params;

  res.send("rota sem parametro");
});

// DESESTRUTURANDO O PORT DO ENV
// const {PORT} = process.env

app.listen(process.env.PORT, () => {
  console.log(`escutando na porta ${process.env.PORT}`);
});
