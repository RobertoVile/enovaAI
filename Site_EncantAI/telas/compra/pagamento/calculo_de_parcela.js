// calculo_parcela.js
// –––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––––
// Este arquivo depende de “carregarPreco()” já ter rodado (inserido .preco-total).
// Ele registra listeners para mostrar/ocultar “Parcelamento” quando “Cartão” for
// marcado e, então, preenche as opções de 1x a 10x.

// Helper para converter “R$ 1.234,56” → 1234.56
function parseBRL(textoBRL) {
  const apenasNumeros = textoBRL
    .replace("R$", "")
    .trim()
    .replace(/\.(?=\d{3},)/g, "")
    .replace(",", ".");
  const num = parseFloat(apenasNumeros);
  return isNaN(num) ? 0 : num;
}

// Helper para formatar 1234.56 → "1.234,56"
function formatar(valor) {
  return valor
    .toFixed(2)               // “1234.56”
    .replace(".", ",")        // “1234,56”
    .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // “1.234,56”
}

// Função que, ao ser chamada, vai ler .preco-total e dividir em até 10 parcelas
function preencherParcelas() {
  const elementoTotal = document.querySelector(".preco-total");
  if (!elementoTotal) {
    console.warn("Não achei .preco-total para calcular parcelas.");
    return;
  }
  const textoTotal = elementoTotal.textContent; // ex.: "R$ 129,90"
  const valorTotal = parseBRL(textoTotal);
  if (valorTotal <= 0) {
    console.warn("Valor total é zero ou parsing falhou.");
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
}

// Ao carregar a página, chame primeiro carregarPreco() e aguarde terminar
document.addEventListener("DOMContentLoaded", async () => {
  // 1) Chama quem carrega total no DOM
  if (typeof window.carregarPreco === "function") {
    await window.carregarPreco();
  }

  // 2) Configuração das forms de pagamento
  const radios = document.querySelectorAll('input[name="formaPagamento"]');
  const detalhesPix = document.querySelector(".detalhes-pix");
  const detalhesCartao = document.querySelector(".detalhes-cartao");
  const detalhesBoleto = document.querySelector(".detalhes-boleto");
  const parcelamentoContainer = document.getElementById("parcelamento");
  const boletoSection = document.querySelector(".boleto-section");
  const botaoCopiarPix = document.querySelector(".botao-copiar");
  const botaoCopiarBoleto = document.querySelector(".boleto-copy-btn");
  const botaoContinuar = document.querySelector(".botao-confirmar-parcelamento");

  // Inicialmente, esconda tudo (exceto o radio PIX que vem marcado no HTML)
  detalhesPix.style.display = "none";
  detalhesCartao.style.display = "none";
  detalhesBoleto.style.display = "none";
  parcelamentoContainer.style.display = "none";
  boletoSection.style.display = "none";
  botaoContinuar.style.display = "none";

  // Cópia de PIX
  if (botaoCopiarPix) {
    botaoCopiarPix.addEventListener("click", () => {
      const inputPix = document.querySelector("#codigo-pix").value;
      navigator.clipboard
        .writeText(inputPix)
        .then(() => alert("Pix copiado!"))
        .catch(err => console.error("Erro ao copiar pix: ", err));
    });
  }

  // Cópia de boleto
  if (botaoCopiarBoleto) {
    botaoCopiarBoleto.addEventListener("click", () => {
      const inputBoleto = document.querySelector("#codigoBoleto").value;
      navigator.clipboard
        .writeText(inputBoleto)
        .then(() => alert("Boleto copiado!"))
        .catch(err => console.error("Erro ao copiar boleto: ", err));
    });
  }

  // Para cada radio, ao mudar, mostre o bloco correspondente
  radios.forEach(radio => {
    radio.checked = false; // desmarca tudo aqui; o HTML já tinha “pix” marcado, mas queremos controlar via JS
    radio.addEventListener("change", () => {
      // Antes de tudo, escondemos todos
      detalhesPix.style.display = "none";
      detalhesCartao.style.display = "none";
      detalhesBoleto.style.display = "none";
      parcelamentoContainer.style.display = "none";
      boletoSection.style.display = "none";
      botaoContinuar.style.display = "none";

      if (radio.value === "pix" && radio.checked) {
        detalhesPix.style.display = "block";
        botaoContinuar.style.display = "block";
      } else if (radio.value === "cartao" && radio.checked) {
        detalhesCartao.style.display = "block";
        parcelamentoContainer.style.display = "block";
        botaoContinuar.style.display = "block";
        preencherParcelas(); // só calcula quando “cartão” estiver marcado
      } else if (radio.value === "boleto" && radio.checked) {
        detalhesBoleto.style.display = "block";
        boletoSection.style.display = "block";
        botaoContinuar.style.display = "block";
      }
    });
  });

  // Se algum radio já estava marcado (por HTML), simule o change para exibir o bloco correto:
  const radioInicial = document.querySelector('input[name="formaPagamento"]:checked');
  if (radioInicial) {
    radioInicial.dispatchEvent(new Event("change"));
  }

  // Botão “Continuar” (confirma pagamento)
  if (botaoContinuar) {
    botaoContinuar.addEventListener("click", () => {
      const forma = document.querySelector('input[name="formaPagamento"]:checked');
      const parcelaSelect = document.querySelector("#parcelamento-select");

      if (forma && forma.value === "cartao") {
        // se cartão, obrigue escolher parcela
        if (!parcelaSelect || !parcelaSelect.value) {
          alert("Escolha uma opção de parcelamento antes de confirmar o pagamento.");
          return;
        }
      }
      // Captura a forma de pagamento escolhida
const formaSelecionada = forma ? forma.value : "";

// Define descrição para salvar
let descricaoPagamento = "";
if (formaSelecionada === "cartao") {
  const numParcelas = parcelaSelect.value;
  descricaoPagamento = `Cartão de Crédito (${numParcelas}x)`;
} else if (formaSelecionada === "pix") {
  descricaoPagamento = "Pix";
} else if (formaSelecionada === "boleto") {
  descricaoPagamento = "Boleto";
}

// Salva no localStorage
localStorage.setItem("formaPagamento", descricaoPagamento);

// Redireciona para a tela de acompanhamento
alert("✅ Pagamento efetuado com sucesso!");

setTimeout(() => {
  window.location.href = "acompanhamento.html";
}, 100);

    });
  }
});
