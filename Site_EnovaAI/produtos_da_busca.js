async function carregarProdutos() {
  const produtosVitrine = [
    { id:14 },
    { id:15 },
    { id:16 },
    { id:10 },
  ]

      for (const produtos of produtosVitrine) {
        const img = document.createElement('img');
       img.src = `http://localhost:3000/api/produto/${produtos.id}/foto`; // importante: use o host do seu servidor
        img.alt = `Produto ${produtos.id}`;
        img.style.width = '200px';
        img.style.width = '200px';

        const card = document.createElement('div');
        card.className = 'card';
        card.appendChild(img);

        document.querySelector('.card-container').appendChild(card);

        card.addEventListener("click",() =>{
        location.href = '/telas/compra/tela_de_compra.html?id=' + produtos.id;
       })

      }
    }
      

    // Certifique-se que a função será chamada após o DOM estar carregado
    document.addEventListener('DOMContentLoaded', carregarProdutos);