async function carregarProdutos() {
  try {
    
    const params = new URLSearchParams(window.location.search);
    const categoria = params.get('categoria');

     

    
    // usa o seletor de classe
    const resposta = await fetch(`/api/produto?categoria=${encodeURIComponent(categoria)}`);

    
    if (!resposta.ok) throw new Error('Erro ao buscar produtos');

    const produtos = await resposta.json();
    const container = document.querySelector('.product-grid');
    container.innerHTML = ''; 

    produtos.forEach(produto => {
      const div = document.createElement('div');
      div.className = 'product-card';
      div.innerHTML = `
      <img src="/api/produto/${produto.id}/foto" alt="${produto.nome}" />
      <h3>${produto.nome}</h3>

    `;

      div.onclick = () => {
        location.href = '/telas/compra/tela_de_compra.html?id=' + produto.id;
      };
      container.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    document.querySelector('.product-grid').innerHTML = '<p>Erro ao carregar produtos.</p>';
  }
}

carregarProdutos();
