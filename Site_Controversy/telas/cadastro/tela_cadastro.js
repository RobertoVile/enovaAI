document.addEventListener('DOMContentLoaded', () => {

    /*------------------------------------
        Máscaras de entrada com Cleave.js
    ------------------------------------*/
    new Cleave('#cpf', {
        delimiters: ['.', '.', '-'],
        blocks: [3, 3, 3, 2],
        numericOnly: true
    });

    new Cleave('#cep', {
        delimiters: ['-'],
        blocks: [4, 4],
        numericOnly: true
    });

    /*------------------------------------
        Seleciona elementos do formulário
    ------------------------------------*/
    const form = document.querySelector('form');
    const messageDiv = document.getElementById('message');

    /*------------------------------------
        Busca endereço via API do CEP
    ------------------------------------*/
    document.getElementById('cep').addEventListener('blur', async () => {
    const cep = document.getElementById('cep').value.replace(/\D/g, '');
    const ruaInput = document.getElementById('rua');
    const bairroInput = document.getElementById('bairro');
    const cidadeInput = document.getElementById('cidade');
    const estadoInput = document.getElementById('estado');

    // Limpa campos e desbloqueia caso CEP vazio ou inválido
    if (cep.length !== 8) {
        ruaInput.value = bairroInput.value = cidadeInput.value = estadoInput.value = '';
        ruaInput.readOnly = bairroInput.readOnly = cidadeInput.readOnly = estadoInput.readOnly = false;
        return;
    }

    try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();

        if (data.erro) {
            alert('CEP não encontrado.');
            ruaInput.value = bairroInput.value = cidadeInput.value = estadoInput.value = '';
            ruaInput.readOnly = bairroInput.readOnly = cidadeInput.readOnly = estadoInput.readOnly = false;
            return;
        }

        // Preenche campos e bloqueia edição
        ruaInput.value = data.logradouro || '';
        bairroInput.value = data.bairro || '';
        cidadeInput.value = data.localidade || '';
        estadoInput.value = data.uf || '';
        ruaInput.readOnly = bairroInput.readOnly = cidadeInput.readOnly = estadoInput.readOnly = true;
    } catch (error) {
        console.error('Erro ao consultar o CEP:', error);
        alert('Não foi possível buscar o endereço. Tente novamente mais tarde.');
        ruaInput.readOnly = bairroInput.readOnly = cidadeInput.readOnly = estadoInput.readOnly = false;
    }
});



    /*------------------------------------
        Evento de envio do formulário
    ------------------------------------*/
    form.addEventListener('submit', async (event) => {
        event.preventDefault();

        // Coleta valores
        const nome = document.getElementById('nome').value.trim();
        const cpf = document.getElementById('cpf').value.trim();
        const email = document.getElementById('email').value.trim();
        const senha = document.getElementById('senha1').value.trim();
        const confirmarSenha = document.getElementById('senha2').value.trim();
        const cep = document.getElementById('cep').value.trim();
        const bairro = document.getElementById('bairro').value.trim();
        const rua = document.getElementById('rua').value.trim();
        const numero = document.getElementById('numero').value.trim();
        const cidade = document.getElementById('cidade').value.trim();
        const estado = document.getElementById('estado').value.trim();
        const complemento = document.getElementById('complemento').value.trim();

        // Limpa mensagens anteriores
        messageDiv.textContent = '';
        messageDiv.className = 'mensagem';

        /*------------------------------------
            Validação de campos obrigatórios
        ------------------------------------*/
        if (!nome || !cpf || !email || !senha || !confirmarSenha ||
            !cep || !bairro || !rua || !numero || !cidade || !estado) {
            messageDiv.textContent = 'Por favor, preencha todos os campos obrigatórios.';
            messageDiv.className = 'mensagem erro';
            return;
        }

        /*------------------------------------
            Validação do Nome: apenas letras e espaços, max 100 caracteres
        ------------------------------------*/
        const nomeRegex = /^[A-Za-zÀ-ÿ\s]{1,100}$/;
        if (!nomeRegex.test(nome)) {
            messageDiv.textContent = 'O nome deve conter apenas letras e espaços (até 100 caracteres).';
            messageDiv.className = 'mensagem erro';
            return;
        }

        /*------------------------------------
            Validação de CPF: apenas números, 11 dígitos
        ------------------------------------*/
        const cpfNumeros = cpf.replace(/\D/g, '');
        if (cpfNumeros.length !== 11) {
            messageDiv.textContent = 'CPF deve conter exatamente 11 dígitos.';
            messageDiv.className = 'mensagem erro';
            return;
        }

        /*------------------------------------
            Validação de CEP: apenas números, 8 dígitos
        ------------------------------------*/
        const cepNumeros = cep.replace(/\D/g, '');
        if (cepNumeros.length !== 8) {
            messageDiv.textContent = 'CEP deve conter exatamente 8 dígitos.';
            messageDiv.className = 'mensagem erro';
            return;
        }

        /*------------------------------------
            Validação de Email: deve conter @ e domínio
        ------------------------------------*/
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            messageDiv.textContent = 'Por favor, insira um email válido contendo "@" e domínio.';
            messageDiv.className = 'mensagem erro';
            return;
        }

        /*------------------------------------
            Validação de Senha: mínimo 6 caracteres, 1 letra maiúscula
        ------------------------------------*/
        const senhaRegex = /^(?=.*[A-Z]).{6,}$/;
        if (!senhaRegex.test(senha)) {
            messageDiv.textContent = 'A senha deve ter pelo menos 6 caracteres e 1 letra maiúscula.';
            messageDiv.className = 'mensagem erro';
            return;
        }

        /*------------------------------------
            Confirmação de senha
        ------------------------------------*/
        if (senha !== confirmarSenha) {
            messageDiv.textContent = 'As senhas não coincidem. Por favor, verifique.';
            messageDiv.className = 'mensagem erro';
            return;
        }

        /*------------------------------------
            Envio dos dados para o servidor
        ------------------------------------*/
        try {
            const response = await fetch('http://localhost:3000/api/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nome, cpf, email, senha,
                    cep, bairro, rua, numero, cidade, estado, complemento
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                messageDiv.textContent = data.message || 'Cadastro realizado com sucesso!';
                messageDiv.className = 'mensagem sucesso';

                setTimeout(() => {
                    window.location.href = '/telas/login/tela_login.html';
                }, 2000);
            } else {
                messageDiv.textContent = data.message || 'Erro ao cadastrar. Tente novamente.';
                messageDiv.className = 'mensagem erro';
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro:', error);
            messageDiv.textContent = 'Erro ao conectar com o servidor. Por favor, tente novamente mais tarde.';
            messageDiv.className = 'mensagem erro';
        }
    });
});
