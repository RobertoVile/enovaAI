document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault(); 

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha1').value;
    const mensagemDiv = document.getElementById('message');

    mensagemDiv.textContent = '';
    mensagemDiv.className = 'mensagem';

    try {
        const response = await fetch('http://localhost:3000/api/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
        });

        const data = await response.json();

        if (response.ok) {
            mensagemDiv.textContent = data.message || "Login bem-sucedido!";
            mensagemDiv.className = 'mensagem sucesso';

            // Salva ID e email no localStorage para o widget
            localStorage.setItem('isLoggedIn', 'true');
            localStorage.setItem('userId', data.id);       // <-- ID do usuário
            localStorage.setItem('userEmail', data.email);

            // Redirecionamento
            const redirectTo = localStorage.getItem('redirectAfterLogin');
            setTimeout(() => {
                if (redirectTo) {
                    localStorage.removeItem('redirectAfterLogin');
                    window.location.href = redirectTo;
                } else {
                    window.location.href = "/tela-inicial.html";
                }
            }, 1000);

        } else {
            mensagemDiv.textContent = data.message || 'Email ou senha incorretos';
            mensagemDiv.className = 'mensagem erro';
            localStorage.removeItem('isLoggedIn');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            localStorage.removeItem('redirectAfterLogin');
        }
    } catch (error) {
        console.error('Erro ao conectar com o servidor:', error);
        mensagemDiv.textContent = 'Erro ao conectar com o servidor. Por favor, tente novamente mais tarde.';
        mensagemDiv.className = 'mensagem erro';
        localStorage.removeItem('isLoggedIn');
        localStorage.removeItem('userId');
        localStorage.removeItem('userEmail');
        localStorage.removeItem('redirectAfterLogin');
    }
});
