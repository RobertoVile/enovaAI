const express = require('express');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const bcrypt = require('bcrypt');
const session = require('express-session');

const app = express();
const PORT = 3000;

// ----------------- Middlewares -----------------
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'Site_EncantAI')));

// Sessão
app.use(session({
    secret: "chave-secreta-top", // troque em produção
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false } // mude para true se usar HTTPS
}));

// ----------------- Banco de dados -----------------
const dbPath = path.join(__dirname, 'controversy.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        return console.error('Erro ao conectar ao banco de dados:', err.message);
    }
    console.log('Conectado ao banco de dados SQLite em:', dbPath);

    db.run(`CREATE TABLE IF NOT EXISTS usuarios (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        senha TEXT NOT NULL
    )`, (err) => {
        if (err) {
            console.error('Erro ao criar tabela de usuários:', err.message);
        } else {
            console.log('Tabela "usuarios" verificada/criada com sucesso.');
        }
    });
});

// ----------------- Rotas de autenticação -----------------

// Cadastro
app.post('/api/cadastro', async (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ success: false, message: 'E-mail e senha são obrigatórios.' });
    }

    db.get('SELECT * FROM usuarios WHERE email = ?', [email], async (err, existingUser) => {
        if (err) {
            return res.status(500).json({ success: false, message: 'Erro interno do servidor ao verificar e-mail.' });
        }

        if (existingUser) {
            return res.status(409).json({ success: false, message: 'E-mail já está cadastrado.' });
        }

        try {
            const hashedPassword = await bcrypt.hash(senha, 10);

            db.run('INSERT INTO usuarios (email, senha) VALUES (?, ?)', [email, hashedPassword], function (err) {
                if (err) {
                    return res.status(500).json({ success: false, message: 'Erro interno do servidor ao cadastrar usuário.' });
                }
                res.status(201).json({ success: true, message: 'Usuário cadastrado com sucesso!' });
            });
        } catch (error) {
            res.status(500).json({ success: false, message: 'Erro interno do servidor ao processar senha.' });
        }
    });
});

// Login
app.post("/api/login", (req, res) => {
    const { email, senha } = req.body;

    if (!email || !senha) {
        return res.status(400).json({ message: "Email e senha são obrigatórios" });
    }

    db.get("SELECT * FROM usuarios WHERE email = ?", [email], async (err, usuario) => {
        if (err) {
            return res.status(500).json({ message: "Erro interno do servidor" });
        }

        if (!usuario) {
            return res.status(401).json({ message: "Usuário não encontrado" });
        }

        const senhaCorreta = await bcrypt.compare(senha, usuario.senha);

        if (senhaCorreta) {
            req.session.usuario = { id: usuario.id, email: usuario.email };
            res.status(200).json({ message: "Login bem-sucedido", id: usuario.id, email: usuario.email });
        } else {
            res.status(401).json({ message: "Senha incorreta" });
        }
    });
});

// Usuário logado
app.get("/usuario-logado", (req, res) => {
    if (req.session.usuario) {
        res.json(req.session.usuario);
    } else {
        res.status(401).json({ message: "Nenhum usuário logado" });
    }
});

// Logout
app.post("/api/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: "Erro ao encerrar sessão" });
        res.json({ message: "Logout realizado com sucesso" });
    });
});

// ----------------- Rotas de produto -----------------
app.get('/api/produto', (req, res) => {
    const categoria = req.query.categoria;
    if (!categoria) {
        return res.status(400).json({ erro: 'Categoria não especificada' });
    }
    const sql = 'SELECT * FROM produto WHERE categoria = ?';
    db.all(sql, [categoria], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao buscar produtos' });
        }
        res.json(rows);
    });
});

app.get('/api/produto/:id', (req, res) => {
    const id = req.params.id;
    const sql = 'SELECT * FROM produto WHERE id = ?';
    db.get(sql, [id], (err, row) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao buscar produto' });
        }
        if (!row) {
            return res.status(404).json({ erro: 'Produto não encontrado' });
        }
        res.json(row);
    });
});

app.get('/api/produto/:id/foto', (req, res) => {
    const id = req.params.id;
    db.get('SELECT foto FROM produto WHERE id = ?', [id], (err, row) => {
        if (err || !row) {
            res.status(404).send('Imagem não encontrada');
            return;
        }
        res.set('Content-Type', 'image/jpeg');
        res.send(row.foto);
    });
});

app.get('/api/produto/:nome/cores', (req, res) => {
    const nome = req.params.nome;
    const sql = `SELECT id, nome, cor FROM produto WHERE nome = ?`;
    db.all(sql, [nome], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao buscar variações de cores' });
        }
        res.json(rows);
    });
});

// ----------------- Rotas de carrinho -----------------
app.post('/carrinho/adicionar/:id', (req, res) => {
    const id = req.params.id;
    const sqlProduto = 'SELECT * FROM produto WHERE id = ?';
    db.get(sqlProduto, [id], (err, produto) => {
        if (err) return res.status(500).json({ erro: 'Erro no banco ao buscar produto' });
        if (!produto) return res.status(404).json({ erro: 'Produto não encontrado' });

        const sqlCarrinho = 'SELECT * FROM carrinho WHERE produto_id = ?';
        db.get(sqlCarrinho, [id], (err, item) => {
            if (err) return res.status(500).json({ erro: 'Erro no banco ao buscar carrinho' });

            if (item) {
                const novaQtd = item.quantidade + 1;
                const sqlUpdate = 'UPDATE carrinho SET quantidade = ? WHERE id = ?';
                db.run(sqlUpdate, [novaQtd, item.id], function (err) {
                    if (err) return res.status(500).json({ erro: 'Erro ao atualizar quantidade' });
                    res.json({ mensagem: `Quantidade atualizada para ${novaQtd}` });
                });
            } else {
                const sqlInsert = 'INSERT INTO carrinho (produto_id, quantidade) VALUES (?, 1)';
                db.run(sqlInsert, [id], function (err) {
                    if (err) return res.status(500).json({ erro: 'Erro ao adicionar ao carrinho' });
                    res.json({ mensagem: 'Produto adicionado ao carrinho' });
                });
            }
        });
    });
});

app.get('/carrinho', (req, res) => {
    const sql = `
        SELECT c.id as carrinho_id, p.id, p.nome, p.modelo, p.cor, p.preco, p.codigo, p.foto, p.descricao, c.quantidade, p.quantidade AS estoque 
        FROM carrinho c
        JOIN produto p ON c.produto_id = p.id
    `;
    db.all(sql, [], (err, rows) => {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao listar carrinho' });
        }
        res.json(rows);
    });
});

app.delete('/carrinho/:id', (req, res) => {
    const carrinhoId = req.params.id;
    const sql = 'DELETE FROM carrinho WHERE id = ?';
    db.run(sql, [carrinhoId], function (err) {
        if (err) {
            return res.status(500).json({ erro: 'Erro ao remover item do carrinho' });
        }
        if (this.changes === 0) {
            return res.status(404).json({ erro: 'Item do carrinho não encontrado' });
        }
        res.json({ mensagem: 'Item removido do carrinho com sucesso' });
    });
});

// ----------------- Inicia o servidor -----------------
app.listen(PORT, () => {
    console.log(`Aplicação rodando em: http://localhost:${PORT}/tela-inicial.html`);
});
