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
    const fileUploadButtons = document.querySelectorAll('.btn-upload');

    // --- Cleave.js para Preço e Quantidade ---
    const cleavePreco = new Cleave('#preco', {
        numeral: true,
        numeralDecimalMark: ',',
        delimiter: '.',
        numeralDecimalScale: 2,
        numeralPositiveOnly: true,
        blocks: [1, 3, 3, 3, 3],
        numericOnly: true
    });

    const cleaveQuantidade = new Cleave('#quantidade', {
        numeral: true,
        numeralDecimalScale: 0,    // nada de casas decimais
        numeralPositiveOnly: true, // apenas positivos
        stripLeadingZeroes: true,   // remove zeros à esquerda
        numericOnly: true
    });


    // --- Validação do formulário ---
    function validateForm() {
        const nomeProdutoValue = nomeProduto.value.trim();
        if (nomeProdutoValue.length === 0 || nomeProdutoValue.length > 100 || !/^[a-zA-Z\s]+$/.test(nomeProdutoValue)) {
            showModal("Erro: Nome do Produto deve conter apenas letras e espaços, com no máximo 100 caracteres.");
            return false;
        }

        // Validar preço via cleave
        const precoRaw = cleavePreco.getRawValue();
        const precoNum = parseFloat(precoRaw);
        if (isNaN(precoNum) || precoNum <= 0) {
            showModal("Erro: Preço Unitário deve ser um número decimal maior que 0.");
            return false;
        }

        // Validar quantidade inteira positiva
        const qtdRaw = cleaveQuantidade.getRawValue();   // raw value sem formatação
        const qtd = parseInt(qtdRaw, 10);
        if (isNaN(qtd) || qtd < 1) {
            showModal("Erro: Quantidade em estoque deve ser um número inteiro positivo.");
            return false;
        }

        // Validar tamanho: no máximo 3 caracteres, só letras maiúsculas
        const tamanhoValue = tamanho.value.trim();
        if (tamanhoValue.length === 0 || tamanhoValue.length > 3 || !/^[A-Z]+$/.test(tamanhoValue)) {
            showModal("Erro: Tamanho deve ter no máximo 3 caracteres, apenas letras maiúsculas, sem espaços ou caracteres especiais.");
            return false;
        }

        // Validar cor: máximo 20 caracteres, apenas letras
        const corValue = cor.value.trim();
        if (corValue.length === 0 || corValue.length > 20 || !/^[a-zA-Z]+$/.test(corValue)) {
            showModal("Erro: Cor deve ter no máximo 20 caracteres, sem números ou caracteres especiais.");
            return false;
        }

        // Validar categoria: máximo 20 caracteres
        const categoriaValue = categoria.value.trim();
        if (categoriaValue.length === 0 || categoriaValue.length > 20) {
            showModal("Erro: Categoria deve ter no máximo 20 caracteres.");
            return false;
        }

        // Descricao: máximo 400 caracteres
        const descricaoValue = descricao.value.trim();
        if (descricaoValue.length > 400) {
            showModal("Erro: Descrição deve ter no máximo 400 caracteres.");
            return false;
        }

        // Imagem JPG obrigatória
        if (!imagemJpg.files || imagemJpg.files.length === 0) {
            showModal("Erro: Imagem JPG é obrigatória.");
            return false;
        } else {
            const jpgName = imagemJpg.files[0].name.toLowerCase();
            if (!(/\.(jpg|jpeg)$/i).test(jpgName)) {
                showModal("Erro: Imagem JPG deve ter extensão .jpg ou .jpeg.");
                return false;
            }
        }

        // Imagem 3D opcional
        if (imagemGbl.files && imagemGbl.files.length > 0) {
            const fileName = imagemGbl.files[0].name.toLowerCase();
            const validExtensions = ['.glb', '.gltf', '.ply', '.3ds', '.fbx', '.stl'];
            const isValid = validExtensions.some(ext => fileName.endsWith(ext));
            if (!isValid) {
                showModal("Erro: O formato da Imagem 3D não é suportado. Formatos aceitos: GLB, GLTF, PLY, 3DS, FBX, STL.");
                return false;
            }
        }

        return true;
    }

    // --- Prevenir caracteres inválidos no campo quantidade enquanto digita ---
    quantidade.addEventListener('input', () => {
        let valor = quantidade.value;

        // remove tudo que não for dígito
        valor = valor.replace(/\D/g, '');

        // remove zeros à esquerda
        valor = valor.replace(/^0+/, '');

        if (valor === '') {
            quantidade.value = '';
        } else {
            quantidade.value = valor;
        }
    });

    // --- Submit do formulário ---
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (validateForm()) {
            showModal("Produto cadastrado com sucesso.", true);
            // se quiser continuar com envio real (não sei como ta ai no back):
            // form.submit();
        }
    });

    // --- Cancelar volta para página anterior ---
    cancelBtn.addEventListener('click', () => {
        window.history.back();
    });

    // --- Botões para upload de arquivo ---
    fileUploadButtons.forEach(button => {
        button.addEventListener('click', () => {
            const fileInput = button.previousElementSibling;
            fileInput.click();
        });
    });

    // --- Atualiza display do nome do arquivo selecionado ---
    imagemJpg.addEventListener('change', () => {
        const fileName = imagemJpg.files.length > 0 ? imagemJpg.files[0].name : '';
        const display = imagemJpg.previousElementSibling;
        if (display) display.value = fileName;
    });

    imagemGbl.addEventListener('change', () => {
        const fileName = imagemGbl.files.length > 0 ? imagemGbl.files[0].name : '';
        const display = imagemGbl.previousElementSibling;
        if (display) display.value = fileName;
    });
});
