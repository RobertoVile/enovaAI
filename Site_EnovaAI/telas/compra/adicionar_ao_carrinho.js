

document.addEventListener("DOMContentLoaded", () => {
    const addCarrinho = document.querySelector('.carrinho-compra')
    const container = document.querySelector('.container-carrinho')

    addCarrinho.addEventListener("click", ()=>{
    const item = document.createElement('div')
    item.classList.add('item-carrinho')

    item.innerHTML = `
        <input type="checkbox" class="checkbox-item" />
        <img src="https://via.placeholder.com/80" alt="Produto">
        <span class="nome">Nome do Produto</span>
        <span class="quantidade">
        <button>-</button>
        <span>1</span>
        <button>+</button>
        </span>
        <span class="preco">R$ 100,00</span>
    `

    container.appendChild(item)
    })
   


}   
)