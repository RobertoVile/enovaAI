// pagamento.js

// ––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// Lógica para carregar total + mostrar/ocultar div de parcelamento
// + calcular o valor de cada parcela. Sem export/import.

// 1) Helpers para converter/formatar valores BRL


import { HeaderFuncoes } from "../../../header.js";
HeaderFuncoes();


function parseBRL(textoBRL) {
  
  const apenasNumeros = textoBRL
    .replace("R$", "")
    .trim()
    .replace(/\.(?=\d{3},)/g, "")
    .replace(",", ".");
  const num = parseFloat(apenasNumeros);
  return isNaN(num) ? 0 : num;
}

function formatar(valor) {
  return valor
    .toFixed(2)
    .replace(".", ",")
    .replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

// 2) Função que insere o "Resumo da Compra" com .preco-total
async function carregarPreco() {
  const container = document.querySelector(".resumo-compra");
  try {
    const pegarId = new URLSearchParams(window.location.search);
    const id = pegarId.get("id");
    if (!id) {
      container.innerHTML = "<h1>Erro ao carregar o preço do produto</h1>";
      return;
    }

    const resposta = await fetch(`/api/produto/${id}`);
    if (!resposta.ok) throw new Error("Erro ao buscar produto");

    const produto = await resposta.json();
    const tipoEntrega = sessionStorage.getItem("tipoEntrega") || "entrega";
    const valorFrete = tipoEntrega === "retirada" ? 0 : 50;
    const total = Number(produto.preco) + valorFrete;

    container.innerHTML = `
      <h2>Resumo da Compra</h2>
      <div class="divisor"></div>
      <ul>
        <li class="resumo-item">
          <span class="descricao">Produto: ${produto.nome}</span>
          <span class="preco">R$ ${Number(produto.preco).toFixed(2)}</span>
        </li>
        <li class="resumo-item">
          <span class="descricao">Frete (${
            tipoEntrega === "retirada" ? "Retirada na Loja" : "Entrega no Endereço"
          })</span>
          <span class="preco">${
            valorFrete === 0 ? "Grátis" : "R$ " + valorFrete.toFixed(2)
          }</span>
        </li>
        <div class="divisor"></div>
        <li class="resumo-item total">
          <span class="descricao">Valor Total</span>
          <span class="preco-total" style="font-weight: bold;">
            R$ ${total.toFixed(2)}
          </span>
        </li>
      </ul>
    `;
  } catch (err) {
    console.error(err);
    const container = document.querySelector(".resumo-compra");
    container.innerHTML = "<p>Erro ao carregar preço</p>";
  }
}

// 3) Função que calcula as parcelas a partir do valor em .preco-total
function preencherParcelas() {
  const elementoTotal = document.querySelector(".preco-total");
  if (!elementoTotal) {
    console.warn("Não encontrei .preco-total.");
    return;
  }
  const textoTotal = elementoTotal.textContent; // ex.: "R$ 129,90"
  const valorTotal = parseBRL(textoTotal);
  if (valorTotal <= 0) {
    console.warn("valorTotal inválido ou zero.");
    return;
  }

  const select = document.querySelector("#parcelamento-select");
  if (!select) return;

  Array.from(select.options).forEach(option => {
    const numParcelas = parseInt(option.value, 10);
    if (isNaN(numParcelas) || numParcelas < 1) return;
    const valorParcela = valorTotal / numParcelas;
    option.text = `${numParcelas}x R$ ${formatar(valorParcela)} sem juros`;
  });

  // Se quiser mostrar o valor da parcela selecionada num <span id="mostraParcelaEscolhida">
  const mostra = document.querySelector("#mostraParcelaEscolhida");
  if (mostra) {
    const num = parseInt(select.value, 10);
    const parcelaNum = num > 0 ? valorTotal / num : 0;
    mostra.textContent = `Cada parcela: R$ ${formatar(parcelaNum)}`;
  }
}

// 4) Quando o DOM estiver pronto, execute tudo na ordem correta
document.addEventListener("DOMContentLoaded", async () => {
  // 4.1) Primeiro, carregue o resumo com total (await garante que .preco-total exista)
  await carregarPreco();

   

  // 4.2)Definir as referências aos elementos de pagamento
const radios = document.querySelectorAll('input[name="formaPagamento"]');
const detalhesPix = document.querySelector(".detalhes-pix");
const detalhesCartao = document.querySelector(".detalhes-cartao");
const detalhesBoleto = document.querySelector(".detalhes-boleto");
const botaoContinuar = document.querySelector(".botao-confirmar-parcelamento");
const parcelamentoCartao = document.querySelector('#parcelamento');
const boletoPagamento = document.querySelector(".boleto-section");
const botaoCopiarPix = document.querySelector(".botao-copiar");
const botaoCopiarBoleto = document.querySelector(".boleto-copy-btn");
const botaoVoltar = document.querySelector(".btn-voltar")


  // 4.3) Esconder todos os detalhes e o parcelamento no início
  detalhesPix.style.display = "none";
  detalhesCartao.style.display = "none";
  detalhesBoleto.style.display = "none";
  parcelamentoCartao.style.display = "none";
  boletoPagamento.style.display = "none";
  botaoContinuar.style.display = "none";

  // 4.4) Configurar evento de cópia de PIX
  if (botaoCopiarPix) {
    botaoCopiarPix.addEventListener("click", () => {
      const inputPix = document.querySelector("#codigo-pix").value;
      navigator.clipboard
        .writeText(inputPix)
        .then(() => alert("Pix copiado!"))
        .catch(err => console.error("Erro ao copiar pix: ", err));
    });
  }

  // 4.5) Configurar evento de cópia de boleto
  if (botaoCopiarBoleto) {
    botaoCopiarBoleto.addEventListener("click", () => {
      const inputBoleto = document.querySelector("#codigoBoleto").value;
      navigator.clipboard
        .writeText(inputBoleto)
        .then(() => alert("Boleto copiado!"))
        .catch(err => console.error("Erro ao copiar boleto: ", err));
    });
  }

  // 4.6) Para cada opção de pagamento, mostrar/ocultar blocos
  radios.forEach(radio => {
    // desmarca todos para controlar via JS (o HTML pode começar com “pix checked”, mas desmarcaremos aqui)
    radio.checked = false;

    radio.addEventListener("change", () => {
      // Primeiro, esconda tudo de novo
     if (radio.value === "pix") {
      boletoPagamento.style.display = 'none';
      parcelamentoCartao.style.display = "none";
      detalhesCartao.style.display = "none";
      botaoContinuar.style.display = "none";
      detalhesBoleto.style.display = "none";
      detalhesPix.style.display = "block";
    } else if (radio.value === "cartao") {
      boletoPagamento.style.display = 'none';
      parcelamentoCartao.style.display = "none";
      detalhesPix.style.display = "none";
      botaoContinuar.style.display = "none";
      detalhesBoleto.style.display = "none";
      detalhesCartao.style.display = "block";
    } else if (radio.value === "boleto") {
      boletoPagamento.style.display = 'none';
      parcelamentoCartao.style.display = "none";
      detalhesPix.style.display = "none";
      detalhesCartao.style.display = "none";
      botaoContinuar.style.display = "none";
      detalhesBoleto.style.display = "block";
    } else {
      boletoPagamento.style.display = 'none';
      parcelamentoCartao.style.display = "none";
      detalhesBoleto.style.display = "none";
      detalhesPix.style.display = "none";
      detalhesCartao.style.display = "none";
      botaoContinuar.style.display = "none";
    }
     });
  });

  // 4.7) Se algum radio vier marcado pelo HTML (ex.: ‘pix checked’), force o evento change
  const radioInicial = document.querySelector('input[name="formaPagamento"]:checked');
  if (radioInicial) {
    radioInicial.dispatchEvent(new Event("change"));
  }

  botaoVoltar.addEventListener("click",()=>{
  window.history.back();
  })



});
