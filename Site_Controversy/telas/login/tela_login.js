document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Impede o envio tradicional do formulário

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha1').value; // Verifique se o ID do campo de senha é 'senha1'
    const mensagemDiv = document.getElementById('message');

    // Limpa mensagens anteriores
    mensagemDiv.textContent = '';
    mensagemDiv.className = 'mensagem'; // Remove classes de erro/sucesso

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        if (response.ok) {
            // Login bem-sucedido:
            mensagemDiv.textContent = data.message || "Login bem-sucedido!";
            mensagemDiv.className = 'mensagem sucesso';

            // Armazena o status de login e o nome do usuário (se disponível) no localStorage
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userName', data.nome || email); // Assumindo que 'data.nome' pode vir da API

            // --- INÍCIO DO TRATAMENTO DE REDIRECIONAMENTO ---
            // Verifica se existe uma URL de redirecionamento salva no localStorage
            const redirectTo = localStorage.getItem('redirectAfterLogin');

            setTimeout(() => {
                if (redirectTo) {
                    // Se houver uma URL para redirecionar, usa ela
                    localStorage.removeItem('redirectAfterLogin'); // Limpa o item para evitar redirecionamentos futuros indesejados
                    window.location.href = redirectTo;
                } else {
                    // Caso contrário, redireciona para a tela inicial padrão
                    window.location.href = "/tela-inicial.html";
                }
            }, 1000); // Pequeno atraso para a mensagem de sucesso ser visível
            // --- FIM DO TRATAMENTO DE REDIRECIONAMENTO ---

        } else {
            // Erro de login: exibe mensagem
            mensagemDiv.textContent = data.message || 'Email ou senha incorretos';
            mensagemDiv.className = 'mensagem erro';
            // Em caso de erro de login, é bom remover qualquer dado de sessão
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userName');
            localStorage.removeItem('redirectAfterLogin'); // Limpa também o redirecionamento
        }
    } catch (error) {
        console.error('Erro ao conectar com o servidor:', error);
        mensagemDiv.textContent = 'Erro ao conectar com o servidor. Por favor, tente novamente mais tarde.';
        mensagemDiv.className = 'mensagem erro';
        // Em caso de erro de conexão, limpa os dados de sessão
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userName');
        localStorage.removeItem('redirectAfterLogin');
    }
});