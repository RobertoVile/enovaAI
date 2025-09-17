// Importação de funções do header
import { HeaderFuncoes } from "../../../header.js";
HeaderFuncoes();

// Variáveis utilizadas para geração de produtos no "Descubra Mais"
let historico = [];
let indiceAtual = -1;

// Referência para a div de mensagens na página de compra
let mensagemAvisoCompra = null;

/**
 * Carrega e exibe os detalhes do produto na página.
 * Também inicializa os listeners para botões de compra/carrinho e outras funcionalidades.
 */
async function carregarProduto() {
    try {
        const params = new URLSearchParams(window.location.search);
        const id = params.get('id');

        if (!id) {
            document.querySelector('.product-container').innerHTML = '<h1>Erro ao carregar produto: ID não encontrado</h1>';
            return;
        }

        const resposta = await fetch(`/api/produto/${id}`);
        if (!resposta.ok) {
            if (resposta.status === 404) {
                document.querySelector('.product-container').innerHTML = '<h1>Produto não encontrado.</h1>';
                return;
            }
            throw new Error(`Erro ao buscar produto: ${resposta.statusText}`);
        }

        const produto = await resposta.json();

        const container = document.querySelector('.product-container');
        container.innerHTML = `
            <div class="product-image">
                <div class="placeholder">
                    <img src="/api/produto/${produto.id}/foto" alt="${produto.nome}">
                </div>
            </div>

            <div class="product-info">
                <h1>${produto.nome}</h1>
                <p class="price">R$${Number(produto.preco).toFixed(2)}</p>

                <div class="color-options">
                    <p>Cor</p>
                    </div>

                <div class="container-filtro">
                    <h3 class="filter-title">Tamanho<span class="arrow-lista">&#9660;</span></h3>
                    <div class="filter-options">
                        <ul>
                            <li>P</li>
                            <li>M</li>
                            <li>G</li>
                            <li>GG</li>
                            <li>XG</li>
                            <li>XXG</li>
                            <li>EG</li>
                        </ul>
                    </div>
                </div>

                <div class="compra">
                    <button class="buy-btn">COMPRAR</button>
                    <img class="carrinho-compra" src="/imagens/carrinho.png" alt="Adicionar ao carrinho" style="cursor:pointer;">
                </div>
                <div id="mensagemAvisoCompra" class="mensagem-aviso"></div>

                <div class="description">
                    <h3>Descrição</h3>
                    <p>${produto.Descricao}</p> </div>
            </div>
        `;

        // Atribui a referência da div de mensagens após o HTML ser inserido no DOM
        mensagemAvisoCompra = document.getElementById('mensagemAvisoCompra');

        // Adiciona listeners para os botões de compra e carrinho
        const buyButton = container.querySelector('.buy-btn');
        const cartIcon = container.querySelector('.carrinho-compra');

        if (buyButton) {
            buyButton.addEventListener('click', () => handlePurchaseAction(produto.id, 'buy'));
        }
        if (cartIcon) {
            cartIcon.addEventListener('click', () => handlePurchaseAction(produto.id, 'add_to_cart'));
        }

        // Reativa setas e filtros
        const headerFiltro = container.querySelector('.filter-title');
        const optionsFiltro = headerFiltro.nextElementSibling;
        const arrowFiltro = headerFiltro.querySelector(".arrow-lista");

        if (headerFiltro) {
            headerFiltro.addEventListener("click", () => {
                optionsFiltro.classList.toggle("show-options");
                if (arrowFiltro) arrowFiltro.classList.toggle("rotated");
            });
        }
        
        // Chama as funções para gerar o carrossel "Descubra Mais" e as opções de cores
        carregarNovoConjunto();
        carregarCores(container, produto.nome);

    } catch (error) {
        console.error('Erro ao carregar produto principal:', error);
        document.querySelector('.product-container').innerHTML = '<p>Erro ao carregar produto. Verifique sua conexão ou tente novamente.</p>';
    }
}

/**
 * Lida com as ações de compra e adição ao carrinho, verificando o status de login do usuário.
 * @param {string} productId O ID do produto em questão.
 * @param {string} action O tipo de ação a ser executada ('buy' para comprar, 'add_to_cart' para adicionar ao carrinho).
 */
async function handlePurchaseAction(productId, action) {
    // Limpa mensagens anteriores antes de exibir uma nova
    if (mensagemAvisoCompra) {
        mensagemAvisoCompra.textContent = '';
        mensagemAvisoCompra.classList.remove('erro', 'sucesso', 'aviso');
    }

    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

    if (isLoggedIn) {
        // Se o usuário está logado, prossegue com a ação
        if (action === 'buy') {
            console.log('Usuário logado. Redirecionando para a confirmação de compra...');
            window.location.href = '/telas/compra/confirmacao_compra.html?id=' + productId;
        } else if (action === 'add_to_cart') {
            console.log('Usuário logado. Adicionando ao carrinho...');
            await AdicionarCarrinho(productId);
            if (mensagemAvisoCompra) {
                 mensagemAvisoCompra.textContent = 'Produto adicionado ao carrinho!';
                 mensagemAvisoCompra.classList.add('sucesso');
                 setTimeout(() => mensagemAvisoCompra.textContent = '', 3000); // Limpa a mensagem após 3 segundos
            }
        }
    } else {
        // Se o usuário NÃO está logado, exibe aviso e redireciona para o login
        console.log('Usuário não logado. Redirecionando para a tela de login...');
        if (mensagemAvisoCompra) {
            mensagemAvisoCompra.textContent = 'Você precisa estar logado para comprar. Redirecionando para o login...';
            mensagemAvisoCompra.classList.add('aviso');

            // Salva a URL da página atual para redirecionar de volta após o login
            localStorage.setItem('redirectAfterLogin', window.location.href);

            setTimeout(() => {
                window.location.href = '/telas/login/tela_login.html';
            }, 2000); // Redireciona após 2 segundos
        } else {
            // Fallback para caso a div de mensagem não esteja disponível
            localStorage.setItem('redirectAfterLogin', window.location.href);
            alert('Você precisa estar logado para comprar. Redirecionando para o login...');
            window.location.href = '/telas/login/tela_login.html';
        }
    }
}

/**
 * Carrega um novo conjunto aleatório de produtos para a seção "Descubra Mais".
 */
async function carregarNovoConjunto() {
    try {
        const resposta = await fetch(`/api/produto?categoria=Moda Casual`); // Adapte a categoria conforme necessário
        if (!resposta.ok) throw new Error('Erro ao buscar produtos para "Descubra Mais"');

        const novasFotos = await resposta.json();
        const embaralhado = novasFotos.sort(() => 0.5 - Math.random());
        const selecionados = embaralhado.slice(0, 3); // Limita a 3 produtos

        // Se avançar, apagamos o "futuro" do histórico
        historico = historico.slice(0, indiceAtual + 1);

        historico.push(selecionados);
        indiceAtual++;
        exibirConjunto(selecionados);
    } catch (error) {
        console.error('Erro ao carregar novo conjunto para Descubra Mais:', error);
    }
}

/**
 * Exibe um conjunto de produtos no carrossel "Descubra Mais".
 * @param {Array<Object>} conjunto Um array de objetos de produto a serem exibidos.
 */
function exibirConjunto(conjunto) {
    const galeria = document.querySelector('.carousel');
    if (!galeria) {
        console.warn('Elemento .carousel não encontrado para exibir conjunto.');
        return;
    }
    galeria.innerHTML = ''; // Limpa o carrossel antes de adicionar novos itens

    conjunto.forEach(produto => {
        const divCard = document.createElement('div');
        divCard.classList.add('carousel-card');

        const img = document.createElement('img');
        img.classList.add('carousel-imagem');
        img.src = `/api/produto/${produto.id}/foto`;
        img.alt = produto.nome;
        img.dataset.id = produto.id;

        const productName = document.createElement('p');
        productName.textContent = produto.nome;
        productName.classList.add('carousel-product-name');

        const productPrice = document.createElement('p');
        productPrice.textContent = `R$${Number(produto.preco).toFixed(2)}`;
        productPrice.classList.add('carousel-product-price');

        divCard.appendChild(img);
        divCard.appendChild(productName);
        divCard.appendChild(productPrice);

        divCard.addEventListener("click", () => {
            if (produto.id) {
                window.location.href = '/telas/compra/tela_de_compra.html?id=' + produto.id;
            }
        });
        galeria.appendChild(divCard);
    });
}

/**
 * Carrega e exibe as variações de cor para o produto atual.
 * @param {HTMLElement} container O elemento HTML que contém a seção de informações do produto.
 * @param {string} nomeProduto O nome do produto para buscar variações de cor.
 */
async function carregarCores(container, nomeProduto) {
    try {
        const resposta = await fetch(`/api/produto/${encodeURIComponent(nomeProduto)}/cores`);
        if (!resposta.ok) throw new Error('Erro ao buscar variações de cores');

        const cores = await resposta.json();
        const galeria = container.querySelector('.color-options');
        if (!galeria) {
            console.warn('Elemento .color-options não encontrado para carregar cores.');
            return;
        }
        galeria.innerHTML = '<p>Cor</p>'; // Mantém o parágrafo "Cor"

        const coresExibidas = cores.slice(0, 5); // Limita a exibição para no máximo 5 cores

        coresExibidas.forEach(produtoCor => {
            const img = document.createElement('img');
            img.classList.add('color-option-image');
            img.src = `/api/produto/${produtoCor.id}/foto`;
            img.alt = `Cor ${produtoCor.cor}`;
            img.dataset.id = produtoCor.id;
            galeria.appendChild(img);
        });

        galeria.addEventListener("click", (event) => {
            if (event.target.tagName === 'IMG' && event.target.classList.contains('color-option-image')) {
                const id = event.target.dataset.id;
                if (id) {
                    window.location.href = '/telas/compra/tela_de_compra.html?id=' + id;
                }
            }
        });

    } catch (error) {
        console.error('Erro ao carregar variações de cores:', error);
        const galeria = container.querySelector('.color-options');
        if (galeria) {
            galeria.innerHTML = '<p>Cor: indisponível</p>';
        }
    }
}

/**
 * Adiciona um produto ao carrinho de compras.
 * @param {string} idProduto O ID do produto a ser adicionado.
 * @param {string} [tamanho=null] O tamanho selecionado do produto (opcional).
 * @param {string} [cor=null] A cor selecionada do produto (opcional).
 */
async function AdicionarCarrinho(idProduto, tamanho = null, cor = null) {
    try {
        const resposta = await fetch(`/carrinho/adicionar/${idProduto}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: idProduto, tamanho, cor })
        });

        const resultado = await resposta.json();
        if (resultado.mensagem) {
            console.log(resultado.mensagem);
        } else if (resultado.erro) {
            console.error(resultado.erro);
        }
    } catch (error) {
        console.error('Erro ao adicionar ao carrinho:', error);
    }
}

// Inicia o carregamento da página de produto assim que o DOM estiver pronto
document.addEventListener('DOMContentLoaded', carregarProduto);

// Listeners para as setas do carrossel "Descubra Mais" (garante que sejam anexados ao DOM completo)
document.addEventListener('DOMContentLoaded', () => {
    const arrowLeft = document.querySelector('.arrow-left');
    const arrowRight = document.querySelector('.arrow-right');

    if (arrowLeft) {
        arrowLeft.addEventListener('click', () => {
            if (indiceAtual > 0) {
                indiceAtual--;
                exibirConjunto(historico[indiceAtual]);
            }
        });
    }

    if (arrowRight) {
        arrowRight.addEventListener('click', carregarNovoConjunto);
    }
});