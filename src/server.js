require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const login = require('./controllers/login.js');
const logout = require('./controllers/logout.js');
const auth = require('./controllers/verifyAuth.js');
const multer = require('multer');
const { GridFSBucket } = require('mongodb');
const { connectToDb, getDb } = require('./config/database.js');
const { findCompany, createInfo, deleteInfo, editInfo } = require('./config/collections/company_info.js');
const { registerCompany, getUsers } = require('./config/collections/company_user.js');
const cookieParser = require('cookie-parser');

//App
const app = express();
app.use(express.json());
app.use(express.static('public'))
app.use(cookieParser());

const upload = multer({ storage: multer.memoryStorage() });

connectToDb();

let bucket;
async function startBd() {
  await connectToDb();
  const bd = getDb();
  bucket = new GridFSBucket(bd, { bucketName: 'uploads' });
}
startBd();

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

app.get('/signin', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/signInPage.html'));
});

//GET

// GET dados básicos das empresas
app.get('/empresas/info', async (req, res) => {
    try{
        const companies = await findCompany();
        res.status(201).json(companies);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao pegar os dados" });
    }
});

// GET logo da empresa
app.get("/empresas/logo/:id", async (req, res) => {
  const { ObjectId, getDb } = require("./config/database.js");

  const id = String(req.params.id).trim();

  if (!ObjectId.isValid(id)) {
    return res.status(400).json({ error: "ID inválido", received: id });
  }

  try {
    const _id = new ObjectId(id);

    const db = getDb();
    const files = await db.collection("uploads.files").findOne({ _id });
    if (!files) return res.status(404).json({ error: "Logo não encontrada" });

    res.set("Content-Type", files.contentType || "application/octet-stream");
    bucket.openDownloadStream(_id).pipe(res);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Erro ao buscar logo" });
  }
});

// Pegar usuários (empresas cadastradas)
app.get('/empresas/usuarios', async (req, res) => {
  try {
    res.status(201).json(await getUsers())
  } catch(err) {
    res.status(500).json({ error: 'Erro ao pegar usuários' })
  }
})

//POST

//Login / logout de empresa
app.post('/api/login', async (req, res) => {
  login(req, res, await getUsers())
});
app.post('api/logout', logout)

//Sign in de empresa
app.post('/api/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    const users = await getUsers();
    const userExists = users.find(user => user.email === email);
    
    if (userExists) {
      return res.status(409).json({ error: 'Empresa já cadastrada' });
    }

    registerCompany(email, bcrypt.hashSync(password, 10));
    res.status(201).json({ message: 'Empresa registrada com sucesso' });
  } catch(err) {
    res.status(500).json({ error: 'Erro ao registrar nova empresa' });
  }
})

// Criar dados básicos das empresas
app.post('/empresas/info', upload.single('logo'), async (req, res) => {
  try {
    if (!req.body) return res.status(400).json({ error: 'Dados inválidos' });
    if (!req.file) return res.status(400).json({ error: 'Logo da empresa é obrigatória' });

    const { nome_empresa, cnpj, razao_social, descricao } = req.body;

    const allowed = ["image/png", "image/jpeg", "image/jpg"];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Formato inválido. Use PNG/JPG/JPEG." });
    }

    // Faz upload no GridFS
    const fileId = await new Promise((resolve, reject) => {
      const uploadStream = bucket.openUploadStream(req.file.originalname, {
        contentType: req.file.mimetype,
        metadata: { size: req.file.size },
      });

      uploadStream.on("finish", () => resolve(uploadStream.id.toString()));
      uploadStream.on("error", reject);

      uploadStream.end(req.file.buffer);
    });

    //  Salva os dados da empresa e o id da logo
    const companyInfo = await createInfo(
      nome_empresa,
      cnpj,
      razao_social,
      fileId,
      descricao
    );

    return res.status(201).json({
      message: "Dados de identificação da empresa criados com sucesso",
      logoFileId: fileId,
      empresa: companyInfo,
    });

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: 'Erro ao criar dados de identificação da empresa' });
  }
});

//PUT

// Editar dados básicos das empresas
app.put('/empresas/dados-de-identificacao/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const updatedData = req.body;

    const resultado = await editInfo(id, updatedData);

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

    const resultado = await deleteInfo(id);

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