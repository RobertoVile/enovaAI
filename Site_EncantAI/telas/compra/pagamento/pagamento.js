import { HeaderFuncoes } from "../../../header.js";
HeaderFuncoes();

// Funções de formatação e análise de valores
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

// Funções de Boleto
function generateRandomBoletoCode() {
  let code = '';
  const characters = '0123456789';
  const codeLength = 47;
  for (let i = 0; i < codeLength; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return code;
}

function copyBoletoCode() {
  const boletoCodeInput = document.getElementById('boletoCode');
  if (!boletoCodeInput) {
    alert("Elemento 'boletoCode' não encontrado.");
    return;
  }
  boletoCodeInput.select();
  boletoCodeInput.setSelectionRange(0, 99999);
  navigator.clipboard.writeText(boletoCodeInput.value).then(() => {
    alert("Código do boleto copiado!");
  }).catch(() => {
    alert("Erro ao copiar o código do boleto.");
  });
}

function downloadBoletoPDF(total) {
  // Acessa jsPDF através do objeto window, que é a forma correta para scripts globais
  const { jsPDF } = window.jspdf;
  const boletoNumber = generateRandomBoletoCode();
  const doc = new jsPDF();
  const currentDate = new Date();
  const dueDate = new Date(currentDate.getTime() + (2 * 24 * 60 * 60 * 1000));
  const documentNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');

  // Cabeçalho do PDF
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('BANCO HONDA S.A.', 20, 25);
  doc.text('341-7', 160, 25);
  doc.setLineWidth(0.5);
  doc.line(20, 30, 190, 30);

  // Beneficiário
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Beneficiário:', 20, 45);
  doc.setFont('helvetica', 'bold');
  doc.text('CONTROVERSY LTDA', 20, 52);
  doc.setFont('helvetica', 'normal');
  doc.text('CNPJ: 12.345.678/0001-90', 20, 59);
  doc.text('Endereço: Rua do Estilo, 123 - São Paulo - SP', 20, 66);

  // Pagador
  doc.text('Pagador:', 20, 85);
  doc.setFont('helvetica', 'bold');
  doc.text('CLIENTE CONTROVERSY', 20, 92);
  doc.setFont('helvetica', 'normal');
  doc.text('CPF: 000.000.000-00', 20, 99);

  // Documento
  doc.text(`Número do Documento: ${documentNumber}`, 20, 115);
  doc.text(`Data de Vencimento: ${dueDate.toLocaleDateString('pt-BR')}`, 20, 122);
  doc.text(`Valor do Documento: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 20, 129);
  doc.text('(-) Desconto/Abatimento: R$ 0,00', 20, 136);
  doc.text('(+) Mora/Multa: R$ 0,00', 20, 143);
  doc.text('(+) Outros Acréscimos: R$ 0,00', 20, 150);
  doc.setFont('helvetica', 'bold');
  doc.text(`(=) Valor Cobrado: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 20, 157);

  // Instruções
  doc.setFont('helvetica', 'normal');
  doc.text('Instruções:', 20, 175);
  doc.text('- Pagamento até o vencimento em qualquer banco', 20, 182);
  doc.text('- Após o vencimento cobrar multa de 2% e juros de 1% ao dia', 20, 189);
  doc.text('- Em caso de dúvidas entre em contato: controversy@gmail.com', 20, 196);

  // Linha pontilhada
  doc.setLineDashPattern([2, 2], 0);
  doc.line(20, 210, 190, 210);
  doc.setLineDashPattern([], 0);

  // Ficha de compensação
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('FICHA DE COMPENSAÇÃO', 75, 225);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Código de Barras:', 20, 240);
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.text('||||| |||| ||||| |||| ||||| |||| ||||| ||||', 20, 250);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text(boletoNumber.replace(/(\d{5})(\d{5})(\d{5})(\d{6})(\d{5})(\d{6})(\d{1})(\d{14})/, '$1.$2 $3.$4 $5.$6 $7 $8'), 20, 265);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Vencimento: ${dueDate.toLocaleDateString('pt-BR')}`, 130, 240);
  doc.text(`Valor: ${total.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}`, 130, 250);
  doc.text(`Doc.: ${documentNumber}`, 130, 260);

  doc.setFontSize(8);
  doc.text('Autenticação Mecânica - Ficha de Compensação', 20, 285);
  doc.text('Recibo do Pagador', 150, 285);

  doc.save(`boleto-controversy-${documentNumber}.pdf`);

  // Feedback visual no botão (opcional)
  const btn = document.querySelector('.btn-baixar-pdf');
  const originalText = btn.innerHTML;
  btn.innerHTML = 'PDF Baixado!';
  btn.style.backgroundColor = '#27ae60';
  setTimeout(() => {
    btn.innerHTML = originalText;
    btn.style.backgroundColor = ''; // Volta à cor padrão
  }, 3000);
}

// Função que insere o "Resumo da Compra" com .preco-total
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
    return total; // Retorna o valor total para uso posterior
  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Erro ao carregar preço</p>";
    return 0;
  }
}

// Função que calcula as parcelas a partir do valor em .preco-total
function preencherParcelas(valorTotal) {
  const select = document.querySelector("#parcelamento-select");
  if (!select || valorTotal <= 0) return;

  Array.from(select.options).forEach(option => {
    const numParcelas = parseInt(option.value, 10);
    if (isNaN(numParcelas) || numParcelas < 1) return;
    const valorParcela = valorTotal / numParcelas;
    option.text = `${numParcelas}x R$ ${formatar(valorParcela)} sem juros`;
  });
}

// Inicialização do script
document.addEventListener("DOMContentLoaded", async () => {
  const valorTotal = await carregarPreco();
  if (valorTotal === 0) return;

  // Configurações do Cleave.js
  if (typeof Cleave !== 'undefined') {
    new Cleave('#numero-cartao', { creditCard: true });
    new Cleave('#validade-cartao', { date: true, datePattern: ['m', 'y'] });
    new Cleave('#cpf', {
      delimiters: ['.', '.', '-'],
      blocks: [3, 3, 3, 2],
      numericOnly: true
    });
  }

  // Elementos DOM
  const radios = document.querySelectorAll('input[name="formaPagamento"]');
  const detalhesPix = document.querySelector(".detalhes-pix");
  const detalhesCartao = document.querySelector(".detalhes-cartao");
  const detalhesBoleto = document.querySelector(".detalhes-boleto");
  const parcelamentoCartao = document.querySelector('#parcelamento');
  const botaoContinuar = document.querySelector(".botao-confirmar-parcelamento");
  const formCartao = document.querySelector('#form-cartao');
  const botaoCopiarPix = document.querySelector(".botao-copiar");
  const btnConfirmarBoleto = detalhesBoleto.querySelector('.btn-confirmar');
  const btnCopiarBoleto = detalhesBoleto.querySelector('div:nth-of-type(2) button');
  const btnBaixarBoleto = detalhesBoleto.querySelector('div:nth-of-type(3) button');

  // Funções de visibilidade
  function ocultarTudo() {
    detalhesPix.style.display = "none";
    detalhesCartao.style.display = "none";
    detalhesBoleto.style.display = "none";
    parcelamentoCartao.style.display = "none";
    botaoContinuar.style.display = "none";
  }
  ocultarTudo();

  // Event Listeners
  if (botaoCopiarPix) {
    botaoCopiarPix.addEventListener("click", () => {
      const inputPix = document.querySelector("#codigo-pix");
      navigator.clipboard.writeText(inputPix.value)
        .then(() => alert("Pix copiado!"))
        .catch(err => console.error("Erro ao copiar pix: ", err));
    });
  }

  radios.forEach(radio => {
    radio.addEventListener("change", () => {
      ocultarTudo();
      if (radio.value === "pix") {
        detalhesPix.style.display = "flex";
      } else if (radio.value === "cartao") {
        detalhesCartao.style.display = "flex";
      } else if (radio.value === "boleto") {
        detalhesBoleto.style.display = "flex";
        const boletoInput = detalhesBoleto.querySelector('div:nth-of-type(2) input');
        if (boletoInput) {
          boletoInput.value = generateRandomBoletoCode();
        }
      }
    });
  });

  if (formCartao) {
    formCartao.addEventListener("submit", (e) => {
      e.preventDefault();
      preencherParcelas(valorTotal);
      parcelamentoCartao.style.display = "flex";
      botaoContinuar.style.display = "flex";
    });
  }

  if (btnCopiarBoleto) {
    btnCopiarBoleto.addEventListener("click", () => {
      const inputBoleto = detalhesBoleto.querySelector('div:nth-of-type(2) input');
      inputBoleto.select();
      inputBoleto.setSelectionRange(0, 99999);
      navigator.clipboard.writeText(inputBoleto.value)
        .then(() => alert("Código do boleto copiado!"))
        .catch(err => console.error("Erro ao copiar boleto: ", err));
    });
  }

  if (btnBaixarBoleto) {
    btnBaixarBoleto.addEventListener('click', () => {
      downloadBoletoPDF(valorTotal);
    });
  }

  if (btnConfirmarBoleto) {
    btnConfirmarBoleto.addEventListener('click', () => {
      alert("Compra com Boleto confirmada! Você tem 2 dias para pagar.");
    });
  }

  const btnConfirmarPix = detalhesPix.querySelector('.botao-confirmar-pix');
  if (btnConfirmarPix) {
    btnConfirmarPix.addEventListener('click', () => {
      alert("Compra com PIX confirmada!");
    });
  }

  if (botaoContinuar) {
    botaoContinuar.addEventListener('click', () => {
      alert("Compra com Cartão confirmada!");
    });
  }

  // Inicialização padrão
  const radioInicial = document.querySelector('input[name="formaPagamento"][value="pix"]');
  if (radioInicial) {
    radioInicial.checked = true;
    detalhesPix.style.display = 'flex';
  }
});