document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('cadastro-form');
    const nomeProduto = document.getElementById('nome-produto');
    const quantidade = document.getElementById('quantidade');
    const tamanho = document.getElementById('tamanho');
    const cor = document.getElementById('cor');
    const categoria = document.getElementById('categoria');
    const preco = document.getElementById('preco');
    const descricao = document.getElementById('descricao');
    const imagemJpg = document.getElementById('imagem-jpg');
    const imagemGbl = document.getElementById('imagem-gbl');
    const cancelBtn = document.getElementById('cancel-btn');
    const modal = document.getElementById('validation-modal');
    const modalMessage = document.getElementById('modal-message');
    const modalOkBtn = document.getElementById('modal-ok-btn');
    const fileUploadButtons = document.querySelectorAll('.btn-upload');
    const fileInputDisplays = document.querySelectorAll('.file-input-display');

    // --- Preço com Cleave.js ---
const cleavePreco = new Cleave('#preco', {
    numeral: true,
    numeralDecimalMark: ',',
    delimiter: '.',
    numeralDecimalScale: 2, 
    numeralPositiveOnly: true,
    blocks: [1, 3, 3, 3, 3],
    numericOnly: true
});



    // --- Função para mostrar o pop-up de erro/sucesso ---
    function showModal(message, isSuccess = false) {
        modalMessage.textContent = message;
        modal.style.display = 'flex';
        modalOkBtn.onclick = () => {
            modal.style.display = 'none';
            if (isSuccess) {
                form.reset();
                fileInputDisplays.forEach(display => display.value = '');
                cleavePreco.setRawValue(''); // limpa o campo preço
            }
        };
    }

    // --- Validações ---
    function validateForm() {
        const nomeProdutoValue = nomeProduto.value.trim();
        if (nomeProdutoValue.length === 0 || nomeProdutoValue.length > 100 || !/^[a-zA-Z\s]+$/.test(nomeProdutoValue)) {
            showModal("Erro: Nome do Produto deve conter apenas letras e espaços, com no máximo 100 caracteres.");
            return false;
        }

        if(preco.value <= 0 ){
            showModal("Erro: Preço deve ser positivo e acima de 0 ");
            return false;
        }
        if (quantidade.value <= 0) {
            showModal("Erro: Quantidade em estoque deve ser um número inteiro positivo.");
            return false;
        }

        // Preço com Cleave.js (pega valor numérico sem formatação)
        let precoValue = parseFloat(cleavePreco.getRawValue());
        if (isNaN(precoValue) || precoValue <= 0) {
            showModal("Erro: Preço Unitário deve ser um número decimal maior que 0.");
            return false;
        }

        if (tamanho.value.length > 3 || !/^[A-Z]+$/.test(tamanho.value)) {
            showModal("Erro: Tamanho deve ter no máximo 3 caracteres, sem espaços ou caracteres especiais.");
            return false;
        }

        if (cor.value.length > 20 || !/^[a-zA-Z]+$/.test(cor.value)) {
            showModal("Erro: Cor deve ter no máximo 20 caracteres, sem números ou caracteres especiais.");
            return false;
        }

        if (categoria.value.length > 20) {
            showModal("Erro: Categoria deve ter no máximo 20 caracteres.");
            return false;
        }

        if (descricao.value.length > 400) {
            showModal("Erro: Descrição deve ter no máximo 400 caracteres.");
            return false;
        }

        if (!imagemJpg.files[0]) {
            showModal("Erro: Imagem JPG é obrigatória.");
            return false;
        }

        // Validação de formato de imagem 3D (opcional)
        if (imagemGbl.files.length > 0) {
            const fileName = imagemGbl.files[0].name.toLowerCase();
            const validExtensions = ['.glb', '.gltf', '.ply', '.3ds', '.fbx', '.stl'];
            const isValid = validExtensions.some(ext => fileName.endsWith(ext));
            if (!isValid) {
                showModal("Erro: O formato da Imagem GBL não é suportado. Formatos aceitos: GLB, GLTF, PLY, 3DS, FBX, STL.");
                return false;
            }
        }

        return true;
    }

    // --- Event Listeners ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
            showModal("Produto cadastrado com sucesso.", true);
        }
    });

    cancelBtn.addEventListener('click', () => {
        window.history.back();
    });

    fileUploadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const fileInput = button.previousElementSibling;
            fileInput.click();
        });
    });

    // Atualiza o display do campo de texto com o nome do arquivo selecionado
    imagemJpg.addEventListener('change', () => {
        const fileName = imagemJpg.files.length > 0 ? imagemJpg.files[0].name : 'xxxxxxxx';
        document.getElementById('imagem-jpg').previousElementSibling.value = fileName;
    });

    imagemGbl.addEventListener('change', () => {
        const fileName = imagemGbl.files.length > 0 ? imagemGbl.files[0].name : 'xxxxxxxx';
        document.getElementById('imagem-gbl').previousElementSibling.value = fileName;
    });
});
