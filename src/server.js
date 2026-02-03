require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const login = require('./controllers/login.js');
const logout = require('./controllers/logout.js');
const auth = require('./controllers/verifyAuth.js');
const { connectToDb, getDb, client } = require('./config/database.js');
const { encontrarEmpresa, criarDadosDeIdentificacao, excluirDadosDeIdentificacao, editarDadosDeIdentificacao } = require('./config/collections/company_basic_info.js');
const cookieParser = require('cookie-parser');

connectToDb();

//App
const app = express();
app.use(express.json());
app.use(express.static('public'))
app.use(cookieParser());

// Rotas HTML
app.get('/initial-page', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/initialPage.html'));
})

app.get('/login', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/loginPage.html'));
})

app.get('/about', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/aboutPage.html'));
});

//GET

// GET dados básicos das empresas
app.get('/empresas/dados-de-identificacao', async (req, res) => {
    try{
        const getEmpresas = await encontrarEmpresa();
        res.status(201).json(getEmpresas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao pegar os dados" });
    }
});

//POST

//Login / logout de empresa
app.post('/api/login', (req, res) => login(req, res, USERS))
app.post('api/logout', logout)

// Criar dados básicos das empresas
app.post('/empresas/dados-de-identificacao', async (req, res) => {
  try {
    const { nome_empresa, cnpj, razao_social, logo, descricao } = req.body

    const dadosDeIdentificacao = await criarDadosDeIdentificacao(nome_empresa, cnpj, razao_social, logo, descricao);
    console.log(dadosDeIdentificacao);
 
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar dados de identificação da empresa' })
  }
})

//PUT

// Editar dados básicos das empresas
app.put('/empresas/dados-de-identificacao/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const resultado = await editarDadosDeIdentificacao(id, updatedData);

    if (resultado) {
      res.status(200).json({ message: "Dados de identificação editados com sucesso." });
    } else {
      res.status(404).json({ error: "Dados de identificação não encontrados." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao editar dados de identificação da empresa." });
  }
})

//DELETE

// Excluir dados básicos das empresas
app.delete('/empresas/dados-de-identificacao/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(id);
    if (!id) return res.status(400).json({ error: "ID da empresa é obrigatório." });

    const resultado = await excluirDadosDeIdentificacao(id);

    if (resultado) {
      res.status(200).json({ message: "Dados de identificação excluídos com sucesso." });
    } else {
      res.status(404).json({ error: "Dados de identificação não encontrados." });
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao excluir dados de identificação da empresa." });
  }
})

app.listen(8080, () => console.log('Servidor rodando na porta 8080 💻🛞🚪'));