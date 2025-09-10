document.addEventListener('DOMContentLoaded', () => {

new Cleave('#cpf', {
    delimiters: ['.', '.', '-'],
    blocks: [3, 3, 3, 2],
    numericOnly: true
});


new Cleave('#cep', {
    delimiters: ['-'],
    blocks: [4,4],
    numericOnly: true
  });


    const form = document.querySelector('form');
    const messageDiv = document.getElementById('message'); // A div já existe no HTML

    form.addEventListener('submit', async (event) => {
        event.preventDefault(); // Impede o envio padrão do formulário

        const email = document.getElementById('email').value;
        const senha = document.getElementById('senha1').value;
        const confirmarSenha = document.getElementById('senha2').value;

        // Limpa mensagens anteriores
        messageDiv.textContent = '';
        messageDiv.className = 'mensagem'; // Remove classes de erro/sucesso

        // Validação no lado do cliente: verifica se as senhas coincidem
        if (senha !== confirmarSenha) {
            messageDiv.textContent = 'As senhas não coincidem. Por favor, verifique.';
            messageDiv.className = 'mensagem erro'; // Adiciona classe para estilizar como erro
            return; // Interrompe a execução se senhas não coincidirem
        }

        try {
            // Envia os dados para o servidor
            const response = await fetch('http://localhost:3000/api/cadastro', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, senha })
            });

            const data = await response.json(); // Pega a resposta JSON do servidor

            if (response.ok && data.success) { // Verifica se a resposta foi bem-sucedida (status 2xx e success: true)
                messageDiv.textContent = data.message || 'Cadastro realizado com sucesso!';
                messageDiv.className = 'mensagem sucesso'; // Adiciona classe para estilizar como sucesso
                
                // Opcional: Um pequeno atraso antes de redirecionar para o usuário ver a mensagem
                setTimeout(() => {
                    window.location.href = '/telas/login/tela_login.html'; // Redireciona para a tela de login
                }, 2000); // Redireciona após 2 segundos
            } else {
                // Se a resposta não foi OK (ex: 400, 409, 500) ou success: false
                messageDiv.textContent = data.message || 'Erro ao cadastrar. Tente novamente.';
                messageDiv.className = 'mensagem erro'; // Adiciona classe para estilizar como erro
            }
        } catch (error) {
            console.error('Erro na requisição de cadastro:', error);
            messageDiv.textContent = 'Erro ao conectar com o servidor. Por favor, tente novamente mais tarde.';
            messageDiv.className = 'mensagem erro'; // Adiciona classe para estilizar como erro
        }
    });
});