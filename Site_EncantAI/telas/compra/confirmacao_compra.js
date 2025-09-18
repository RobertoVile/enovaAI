// Importação de funções do header
import { HeaderFuncoes } from "../../header.js";
HeaderFuncoes();

const btn = document.querySelector(".botao-voltar")

btn.addEventListener("click",()=>{
  window.history.back();
})




async function carregarPreco() {
  const container = document.querySelector('.resumo-compra');


  try {
    const pegarId = new URLSearchParams(window.location.search);
    const id = pegarId.get('id');

    if (!id) {
      container.innerHTML = '<h1>Erro ao carregar o preço do produto</h1>';
      return;
    }

    const resposta = await fetch(`/api/produto/${id}`);
    if (!resposta.ok) throw new Error('Erro ao buscar produto');

    const produto = await resposta.json();

    const radios = Array.from(document.querySelectorAll('input[name="entrega"]'));
    const selecionado = radios.find(r => r.checked);
    const isRetirada = radios.indexOf(selecionado) === 1;

    let valorFrete = 0;
    if (!isRetirada) {
      valorFrete = 50;
    }

    const totalComFrete = Number(produto.preco + valorFrete).toFixed(2);

    let html = `
      <h2>Resumo da Compra</h2>
      <div class="divisor"></div>
      <ul class="lista-confirmacao">
      
        <li style="margin-bottom: 30px;"><strong>Produto:</strong> ${produto.nome}</li>
        <div class="divisor"></div>
        <li style="margin-bottom: 30px;"><strong>Preço:</strong> R$ ${produto.preco.toFixed(2).replace(".", ",")}</li>
      </ul>
    `;

    if (valorFrete > 0) {
      html += `
        <div class="divisor"></div>
        <div class="total-confirmacao" style="margin-bottom: 30px;">
          <span class="descricao">Frete:</span>
          <span class="preco-total">R$ ${valorFrete.toFixed(2).replace(".", ",")}</span>
        </div>
      `;
    }

    html += `
      <div class="divisor"></div>
      <div class="total-confirmacao">
        <span class="descricao-total">Valor Total:</span>
        <span class="preco-total">R$ ${totalComFrete.replace(".", ",")}</span>
      </div>
    `;

    container.innerHTML = html;

  document.querySelector(".botao-continuar").addEventListener('click', () => {
  const tipoEntrega = document.querySelector('input[name="entrega"]:checked')?.nextElementSibling?.textContent.includes("Retirada") ? "retirada" : "entrega";

  sessionStorage.setItem("tipoEntrega", tipoEntrega);
  location.href = `pagamento/pagamento.html?id=${produto.id}`;
});


  } catch (err) {
    console.error(err);
    container.innerHTML = "<p>Erro ao carregar preço</p>";
  }
}

// Quando os rádios mudarem, recarrega os valores
document.querySelectorAll('input[name="entrega"]').forEach(radio => {
  radio.addEventListener('change', carregarPreco);
});

// Executa assim que a página carrega
carregarPreco();
