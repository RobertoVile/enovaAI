import { HeaderFuncoes } from "../../../header.js";
HeaderFuncoes();

async function carregarPreco() {
  const container = document.querySelector('.resumo-compra');

  try {
    const dados = localStorage.getItem('produtosSelecionados');
    if (!dados) {
      container.innerHTML = "<p>Não há itens para confirmar.</p>";
      return;
    }

    const obj = JSON.parse(dados);
    const produtos = obj.produtos;

    // 1) Transforma valorTotal em string
    let stringTotal = String(obj.valorTotal);

    // 2) Remove apenas pontos de milhar (regex)
    stringTotal = stringTotal.replace(/\.(?=\d{3},)/g, "");

    // 3) Se houver vírgula decimal, transforma em ponto        
    stringTotal = stringTotal.replace(",", ".");

    // 4) Por fim, parseFloat → obtém um número de verdade
    let valorProdutos = parseFloat(stringTotal);
    if (isNaN(valorProdutos)) valorProdutos = 0;

    // 5) Pega o frete (se existir), senão é zero
    const frete = typeof obj.valorFrete === "number" ? obj.valorFrete : 0; 
    const valorTotal = valorProdutos + frete;

    // 6) Monta o HTML, exibindo “Frete” apenas se frete > 0
    let html = `
      <h2>Resumo da Compra</h2>
      <div class="divisor"></div>
      <ul>
        <li class="resumo-item">
          <div id="lista-produtos">
            <span class="descricao">Lista</span>
            <ul class="lista-confirmacao"></ul>
          </div>
        </li>
    `;

    if (frete > 0) {
      html += `
        <li class="resumo-item">
          <span class="descricao">Frete</span>
          <span class="preco">R$ ${frete.toFixed(2).replace(".", ",")}</span>
        </li>
        <div class="divisor"></div>
      `;
    } else {
      html += `<div class="divisor"></div>`;
    }

    html += `
        <li class="resumo-item total">
          <span class="descricao-total">Valor Total</span>
          <span class="preco-total">R$ ${valorTotal.toFixed(2).replace(".", ",")}</span>
        </li>
      </ul>
    `;
    container.innerHTML = html;

    // 7) Preenche a lista de produtos
    const listaConfirmacao = container.querySelector(".lista-confirmacao");
    listaConfirmacao.innerHTML = "";
    produtos.forEach(prod => {
      const qtd = prod.quantidade || 1;
      const li = document.createElement("li");
      li.classList.add("item-confirmacao");
      li.textContent = `${prod.nome} - x${qtd}`;
      listaConfirmacao.appendChild(li);
    });

  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Erro ao carregar preço</p>";
  }
}


carregarPreco();

// o restante do seu código (radios, botões, etc.) continua igual
const radios = document.querySelectorAll('input[name="formaPagamento"]');
const detalhesPix = document.querySelector(".detalhes-pix");
const detalhesCartao = document.querySelector(".detalhes-cartao");
const detalhesBoleto = document.querySelector(".detalhes-boleto");
const botaoContinuar = document.querySelector(".botao-confirmar-parcelamento");
const parcelamentoCartao = document.querySelector('#parcelamento');
const boletoPagamento = document.querySelector(".boleto-section");
const botaoCopiarPix = document.querySelector(".botao-copiar");
const botaoCopiarBoleto = document.querySelector(".boleto-copy-btn");

// Reset inicial
  detalhesPix.style.display = "none";
  detalhesCartao.style.display = "none";
  detalhesBoleto.style.display = "none";
  parcelamentoCartao.style.display = "none";
  boletoPagamento.style.display = "none";
  botaoContinuar.style.display = "none";

// Botão copiar boleto
botaoCopiarBoleto.addEventListener("click", () => {
  const inputBoleto = document.querySelector("#codigoBoleto").value;
  navigator.clipboard.writeText(inputBoleto).then(() => {
    alert("Boleto copiado!");
  }).catch(err => {
    console.error("Erro ao copiar boleto: ", err);
  });
});

// Botão copiar pix
botaoCopiarPix.addEventListener("click", () => {
  const inputPix = document.querySelector("#codigo-pix").value;
  navigator.clipboard.writeText(inputPix).then(() => {
    alert("Pix copiado!");
  }).catch(err => {
    console.error("Erro ao copiar pix: ", err);
  });
});

radios.forEach(radio => radio.checked = false);

radios.forEach(radio => {
 
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
