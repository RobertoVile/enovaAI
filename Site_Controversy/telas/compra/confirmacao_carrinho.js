// Importação de funções do header
import { HeaderFuncoes } from "../../header.js";
HeaderFuncoes();

document.addEventListener("DOMContentLoaded", () => {

  async function carregarPreco() {
    const container = document.querySelector(".resumo-compra");
    container.innerHTML = ""; // limpa tudo

    try {
      // 1) Lê 'produtosSelecionados' do localStorage
      const dadosRaw = localStorage.getItem("produtosSelecionados");
      if (!dadosRaw) {
        console.warn("Nada encontrado em 'produtosSelecionados' no localStorage");
        container.innerHTML = "<p>Não há itens para confirmar.</p>";
        return;
      }

      let obj;
      try {
        obj = JSON.parse(dadosRaw);
      } catch {
        console.error("JSON inválido em 'produtosSelecionados'");
        container.innerHTML = "<p>Erro ao ler itens salvos.</p>";
        return;
      }

      const produtos = obj.produtos;
      const subtotal = obj.valorTotal; // já vem sem frete
      if (!Array.isArray(produtos) || produtos.length === 0) {
        console.warn("`produtos` não é array válido ou está vazio:", produtos);
        container.innerHTML = "<p>Não há itens para confirmar.</p>";
        return;
      }

      // 2) Decide se aplica frete ou não, lendo o radio selecionado
      const radios = Array.from(document.querySelectorAll('input[name="entrega"]'));
      const selecionado = radios.find(r => r.checked);
      // índice 0 = “Enviar no meu Endereço”, índice 1 = “Retirada na loja”
      const isRetirada = radios.indexOf(selecionado) === 1;

      let valorFrete = 0;
      if (!isRetirada) {
        // se NÃO for retirada na loja, cobra frete
        valorFrete = 50;
      }

      const totalComFrete = subtotal + valorFrete;

      // 3) Monta o HTML básico (título + lista em branco)
      let html = `
        <h2>Confirme seus itens</h2>
        <div class="divisor"></div>
        <ul class="lista-confirmacao"></ul>
      `;

      // 4) Se há frete (ou seja, não é retirada), exibe o bloco de frete
      if (valorFrete > 0) {
        html += `
          <div class="divisor"></div>
          <div class="total-confirmacao" style="margin-bottom: 30px;">
            <span class="descricao">Frete:</span>
            <span class="preco-total">R$ ${valorFrete.toFixed(2).replace(".", ",")}</span>
          </div>
        `;
      }

      // 5) Sempre exibe o total (subtotal + frete se houver)
      html += `
        <div class="divisor"></div>
        <div class="total-confirmacao">
          <span class="descricao-total">Valor Total:</span>
          <span class="preco-total">R$ ${totalComFrete.toFixed(2).replace(".", ",")}</span>
        </div>
      `;

      container.innerHTML = html;

      // 6) Preenche a lista de produtos
      const ul = container.querySelector(".lista-confirmacao");
      produtos.forEach(item => {
        const li = document.createElement("li");
        li.classList.add("resumo-item");
        li.innerHTML = `
          <span class="descricao">${item.nome}</span>
          <span class="quantidade">${item.quantidade} ×</span>
        `;
        ul.appendChild(li);
      });
    }
    catch (err) {
      console.error(err);
      container.innerHTML = "<p>Erro ao carregar resumo de compra.</p>";
    }
  }

  // 7) Chama pela primeira vez ao carregar a página
  carregarPreco();

  // 8) Sempre que o usuário mudar o radio “entrega”, atualiza o resumo
  document.querySelectorAll('input[name="entrega"]').forEach(radio => {
    radio.addEventListener("change", carregarPreco);
  });

  // 9) “Continuar” deve remover valorFrete do localStorage se for Retirada
  document.querySelector(".botao-continuar").addEventListener("click", () => {
    const dadosRaw = localStorage.getItem("produtosSelecionados");
    if (!dadosRaw) {
      alert("Nenhum produto selecionado.");
      return;
    }

    // Converte em objeto para manipular
    const obj = JSON.parse(dadosRaw);

    // Detecta novamente se a opção é Retirada na loja
    const radios = Array.from(document.querySelectorAll('input[name="entrega"]'));
    const selecionado = radios.find(r => r.checked);
    const isRetirada = radios.indexOf(selecionado) === 1;

    if (isRetirada) {
      // Se for retirada, exclui a propriedade 'valorFrete'
      delete obj.valorFrete;
      // (Opcional) Se você quiser garantir que o total não inclua frete:
      // obj.valorTotal = obj.valorTotal; // já só tem o subtotal
    } else {
      // Se for envio, assegura que valorFrete esteja presente
      obj.valorFrete = 50;
    }

    // Grava de volta no localStorage
    localStorage.setItem("produtosSelecionados", JSON.stringify(obj));

    // Redireciona para pagamento
    window.location.href = 'pagamento/pagamento_carrinho.html';
  });

});
