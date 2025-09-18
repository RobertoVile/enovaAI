// carrinho.js
import { HeaderFuncoes } from "../../header.js";
HeaderFuncoes();



document.addEventListener("DOMContentLoaded", () => {

  const carrinhoContainer = document.querySelector(".coluna-esquerda");
  const marcarTodosCheckbox = document.querySelector(".input_todos");
  const totalEl = document.querySelector(".valor-total");
  const pixEl   = document.querySelector(".valor-pix");

  // 1) Buscar dados do servidor e renderizar tudo
  async function carregarCarrinho() {
    try {
      const res = await fetch("/carrinho");
      if (!res.ok) throw new Error("Falha ao carregar carrinho");
      const itens = await res.json();

   
      if (itens.length === 0) {
        carrinhoContainer.innerHTML = "<p>Seu carrinho está vazio.</p>";
     
        return;
      }


      itens.forEach(renderItem);
     
    } catch (err) {
      console.error(err);
      carrinhoContainer.innerHTML = "<p>Erro ao carregar carrinho.</p>";
    }
  }


  // 2) Monta o DOM de um item e injeta interações
  function renderItem(itemData) {
    const { carrinho_id, id, nome, quantidade, preco,estoque} = itemData;
    const wrapper = document.createElement("div");
    wrapper.classList.add("item-carrinho");
    wrapper.dataset.carrinhoId = carrinho_id;
     wrapper.dataset.estoqueMax = estoque

    wrapper.innerHTML = `
      <input type="checkbox" class="checkbox-item" name="produto" />
      <div class="imagem-produto">
        <img src="/api/produto/${id}/foto" alt="${nome}">
      </div>
      <div class="descricao-produto">
        <h3 class = "nome" >${nome}</h3>
        <div class="acoes">
          <a href="#" class="excluir-item">Excluir</a> |
          <a href="#" class="alterar-item">Alterar</a>
        </div>
      </div>
      <div class="quantidade-preco">
        <div class="quantidade">
          <button class="diminuir">-</button>
          <span>${quantidade}</span>
          <button class="aumentar">+</button>
        </div>
        <div class="preco">R$ ${formatar(preco * quantidade)}</div>
      </div>
    `;


    // excluir
    wrapper.querySelector(".excluir-item").addEventListener("click", async e => {
      e.preventDefault();
      await removerDoCarrinho(carrinho_id);
      wrapper.remove();
      
    });


    // quantidade
    wrapper.querySelector(".aumentar").addEventListener("click", e => {
      
      atualizarQuantidade(wrapper,+1);
    });
    wrapper.querySelector(".diminuir").addEventListener("click", e => {

      atualizarQuantidade(wrapper,-1);
    });

    carrinhoContainer.appendChild(wrapper);
    const checkbox = wrapper.querySelector(".checkbox-item");
    checkbox.addEventListener("change", atualizarTotais);




  }

  // 3) Ajusta quantidade e atualiza valor no DOM (sem persistência no servidor)
  function atualizarQuantidade(itemEl,delta) {
    try{

    const span = itemEl.querySelector(".quantidade span");

    const estoqueMax = parseInt(itemEl.dataset.estoqueMax,10)
   
    let qtdAtual = parseInt(span.textContent, 10);
    let novaQtd = qtdAtual + delta

    if (novaQtd < 1) novaQtd = 1;

    if (novaQtd > estoqueMax){
      return
    }
      

    



    span.textContent = novaQtd;

    const precoEl = itemEl.querySelector(".preco");
    // lê preço unitário dividindo total atual pela quantidade anterior
    const totalAntes = parseFloat(precoEl.textContent.replace("R$ ", "").replace(/\./g,"").replace(",","."));
    const unit = totalAntes / qtdAtual;
    precoEl.textContent = `R$ ${formatar(unit * novaQtd)}`;

     atualizarTotais();
    }


    catch(err){
     console.error(err);
    }

   
  }

  // 4) Remoção no servidor
  async function removerDoCarrinho(carrinhoId) {
    await fetch(`/carrinho/${carrinhoId}`, { method: "DELETE" });
  }

  // 5) Marcar todos / desmarcar todos
  if (marcarTodosCheckbox) {
    marcarTodosCheckbox.addEventListener("change", () => {
      const marc = marcarTodosCheckbox.checked;
      carrinhoContainer.querySelectorAll(".checkbox-item")
        .forEach(cb => cb.checked = marc);
      atualizarTotais();
    });
  }


    // 6) Atualizar totais
function atualizarTotais() {
  let total = 0;
  let algumMarcado = false;
  const produtosSelecionados = [];

  document.querySelectorAll(".item-carrinho").forEach(itemEl => {
    const cb = itemEl.querySelector(".checkbox-item");

    if (cb && cb.checked) {
      const nome = itemEl.querySelector(".nome").textContent;
      const inputQtd = itemEl.querySelector(".quantidade-input");
      const qtd = inputQtd ? parseInt(inputQtd.value) || 1 : 1;

      const textoPreco = itemEl
        .querySelector(".preco")
        .textContent
        .replace(/[^\d,\.]/g, "")
        .replace(/\.(?=\d{3},)/g, "")
        .replace(",", ".");

      const valor = parseFloat(textoPreco);
      if (!isNaN(valor)) {
        total += valor;
        algumMarcado = true;

        // Adiciona ao array de produtos
        produtosSelecionados.push({
          nome: nome,
          quantidade: qtd
        });
      }
    }
  });

  // Atualiza os elementos na tela
  const totalEl = document.querySelector(".valor-total");
  const pixEl = document.querySelector(".valor-pix");
  const totalFinal = algumMarcado ? total : 0;
  const valorPix = algumMarcado ? total * 0.95 : 0;

  if (totalEl) totalEl.textContent = `R$ ${formatar(totalFinal)}`;
  if (pixEl)   pixEl.textContent   = `R$ ${formatar(valorPix)}`;

  // ✅ Salva no localStorage
  const dadosParaSalvar = {
    produtos: produtosSelecionados,
    valorTotal: parseFloat(totalFinal.toFixed(2)) // duas casas decimais
  };

  localStorage.setItem("produtosSelecionados", JSON.stringify(dadosParaSalvar));
}


   // 7) Formatação de moeda
  function formatar(valor) {
    return valor
      .toFixed(2)                // duas casas
      .replace(".", ",")         // vírgula decimal
      .replace(/\B(?=(\d{3})+(?!\d))/g, "."); // ponto a cada 3 dígitos
  }


  // inicializa

document.querySelector(".botao-comprar").addEventListener("click", () => {
  // Seleciona somente os item-carrinho marcados
  const itensMarcados = Array.from(
    document.querySelectorAll('.item-carrinho')
  ).filter(itemEl => {
    const cb = itemEl.querySelector('.checkbox-item');
    return cb && cb.checked;
  });

  // Monta array de objetos { nome, quantidade }
  const produtosParaSalvar = itensMarcados.map(itemEl => {
    // Nome: pega do <h3> dentro de .descricao-produto
    const nome = itemEl.querySelector('.descricao-produto h3').textContent.trim();

    // Quantidade: pega do <span> dentro de .quantidade
    const quantidade = parseInt(
      itemEl.querySelector('.quantidade span').textContent.trim(),
      10
    ) || 1;

    return { nome, quantidade };
  });

  // Calcula “valorTotal” somando todos os preços já exibidos (R$ X.XXX,YY)
  let valorTotal = 0;
  itensMarcados.forEach(itemEl => {
    // .preco já contém “R$ 1.234,56” no HTML
    const textoPreco = itemEl
      .querySelector('.preco')
      .textContent
      .replace(/[^\d,\.]/g, "")     // mantém apenas dígitos, vírgula e ponto
      .replace(/\.(?=\d{3},)/g, "") // remove pontos de milhares
      .replace(",", ".");           // vírgula → ponto
    
    const valor = parseFloat(textoPreco);
    if (!isNaN(valor)) valorTotal += valor;
  });


 const valorPix = valorTotal * 0.95;
 const frete = 50.00
if (produtosParaSalvar.length === 0) {
  alert("Você precisa selecionar pelo menos um item para continuar.");
  return; // impede salvar dados incompletos
}

  const objParaSalvar = {
  produtos: produtosParaSalvar,
  valorTotal: parseFloat(valorTotal.toFixed(2)),
  valorPix: parseFloat(valorPix.toFixed(2)),
  valorFrete: parseFloat(frete.toFixed(2))
};

  // Salva no localStorage
  localStorage.setItem(
    'produtosSelecionados',
    JSON.stringify(objParaSalvar)
  );

  // Redireciona para pagamento
  location.href = '../compra/confirmacao_carrinho.html';
});

carregarCarrinho();

});
