require('dotenv').config();
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const login = require('./controllers/login.js');
const logout = require('./controllers/logout.js');
const auth = require('./controllers/verifyAuth.js');
const multer = require('multer');
const { GridFSBucket, ObjectId } = require('mongodb');
const { connectToDb, getDb } = require('./config/database.js');
const { getInfos, findCompany, createInfo, deleteInfo, editInfo } = require('./config/collections/company_info.js');
const { createContact, getContacts, findContact, editContact, deleteContact } = require('./config/collections/company_contact.js');
const { findUser, registerCompany, getUsers } = require('./config/collections/company_user.js');
const cookieParser = require('cookie-parser');
const verifyAuth = require('./controllers/verifyAuth.js');
const { error } = require('console');

//App
const app = express();
app.use(express.json());
app.use(express.static('public'))
app.use(cookieParser());

const upload = multer({ storage: multer.memoryStorage() });

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

app.get('/sign-in', async (req, res) => {
  res.sendFile(path.join(__dirname, '../public/pages/signInPage.html'));
});

//GET

// GET dados básicos das empresas
app.get('/empresas/infos', async (req, res) => {
    try{
        const companies = await getInfos();
        res.status(201).json(companies);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao pegar os dados" });
    }
});

// GET dados básicos de uma empresa pelo id
app.get('/empresas/info/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const companyInfo = await findCompany(id);

    if (!companyInfo) {
      return res.status(404).json({ message: "Empresa não encontrada" });
    }

    res.status(200).json(companyInfo);
  } catch (err) {
    res.status(500).json({ error: "Erro ao pegar os dados de identificação da empresa:", error: err.message });
  }
})

//GET dados de contato das empresas
app.get('/empresas/contatos', async (req, res) => {
  try {
    const contacts = await getContacts();
    res.status(201).json(contacts);
  } catch (err) {
    res.status(500).json({ error: "Erro ao pegar os dados de contato das empresas:", error: err.message });
  }
});

//GET dados de contato de uma empresa pelo id
app.get('/empresas/contato/:id', async (req, res) => {
  try {
    const id = req.params.id;
    const contactInfo = await findContact(id);
    if (!contactInfo) {
      return res.status(404).json({ error: "Contato da empresa não encontrado" });
    }
    res.status(200).json(contactInfo);
  } catch (err) {
    res.status(500).json({ error: "Erro ao pegar os dados de contato da empresa:", error: err.message });
  }
});

// GET todos os usuários
app.get('/empresas/users', async (req, res) => {
  try {
    const users = await getUsers();
    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: "Erro ao pegar os usuários:", error: err.message });
  }
})

// Get user com id
app.get('/empresas/user/:id', async (req, res) => {
  try {
    const id = req.params.id;
    
    const user = await findUser(id); 
    
    if (!user) {
      return res.status(404).json({ message: "Usuário não encontrado" });
    }

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao pegar usuário', details: err.message });
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

//POST

//Login / logout de empresa
app.post('/api/login', async (req, res) => {
  login(req, res, await getUsers())
});
app.post('api/logout', logout)
app.get('/api/verify', verifyAuth, (req, res) => {
  res.json({ message: 'acesso permitido a rota protegida', user: req.user })
});

//Sign in de empresa (Cadastro)
app.post('/api/signin', async (req, res) => { 
  try {
    const { email, password } = req.body;
    
    if (!email || !password) return res.status(400).json({ error: 'Email e senha são obrigatórios' });

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

    const { user_id, nome_empresa, cnpj, razao_social, descricao } = req.body;

    if (!user_id || !nome_empresa || !cnpj || !razao_social || !descricao) {
      return res.status(400).json({ error: "Campos obrigatórios estão faltando." });
    }

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
      user_id,
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

// Criar dados de contato da empresa
app.post('/empresas/contato', async (req, res) => {
  try {
    if  (!req.body) return res.status(400).json({ error: 'Dados inválidos' });

    const { user_id, telefone, email, facebook, instagram, linkedin, twitter } = req.body;

    if (!user_id || !telefone || !email) return res.status(400).json({ error: "Campos obrigatórios estão faltando." });

    const patterns = {
      facebook: /^https:\/\/(www\.)?facebook\.com\/[^\/]+\/?$/i,
      instagram: /^https:\/\/(www\.)?instagram\.com\/[^\/]+\/?$/i,
      linkedin: /^https:\/\/(www\.)?linkedin\.com\/[^\/]+\/?$/i,
      twitter: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[^\/]+\/?$/i
    };

    const validateUrl = (url, pattern, name) => {
      if (url && !pattern.test(url)) {
        return `URL inválida para ${name}`;
      }
      return null;
    };

    const errors = [
      validateUrl(facebook, patterns.facebook, "Facebook"),
      validateUrl(instagram, patterns.instagram, "Instagram"),
      validateUrl(linkedin, patterns.linkedin, "LinkedIn"),
      validateUrl(twitter, patterns.twitter, "Twitter/X"),
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    const contactInfo = await createContact(
      user_id,
      telefone,
      email,
      facebook,
      instagram,
      linkedin,
      twitter
    )

    if (!contactInfo) {
      return res.status(500).json({ error: 'Erro ao criar dados de contato da empresa' });
    }
    return res.status(201).json({ message: 'Dados de contato da empresa criados com sucesso', contato: contactInfo });
  } catch (err) {
    res.status(500).json({ error: 'Erro ao criar dados de contato da empresa:', error: err.message });
  }
});

//PUT

// Editar dados básicos das empresas

app.put("/empresas/info/:info_id", upload.single("logo"), async (req, res) => {
  try {
    const { info_id } = req.params;
    if (!info_id) {
      return res.status(400).json({ error: "info_id é obrigatório." });
    }

    const { nome_empresa, cnpj, razao_social, descricao } = req.body || {};
    const updateFields = {};

    if (nome_empresa !== undefined) updateFields.nome_empresa = String(nome_empresa).trim();
    if (razao_social !== undefined) updateFields.razao_social = String(razao_social).trim();
    if (descricao !== undefined) updateFields.descricao = String(descricao).trim();

    if (cnpj !== undefined) {
      const onlyDigits = String(cnpj).replace(/\D/g, "");
      if (onlyDigits.length !== 14) {
        return res.status(400).json({ error: "CNPJ inválido (precisa ter 14 dígitos)." });
      }
      updateFields.cnpj = onlyDigits;
    }

    if (req.file) {
      const filename = Date.now() + "-" + req.file.originalname;
      const uploadStream = bucket.openUploadStream(filename);

      uploadStream.end(req.file.buffer);

      uploadStream.on("finish", async () => {
        const fileId = uploadStream.id; // agora é o mesmo _id em upload.files
        updateFields.logo = fileId;

        const updated = await editInfo(info_id, updateFields);

        if (!updated) {
          return res.status(404).json({ error: "Info da empresa não encontrada para este info_id." });
        }

        return res.status(200).json({
          message: "Info da empresa atualizada com sucesso",
          info: updated,
        });
      });
    } else {
      if (Object.keys(updateFields).length === 0) {
        return res.status(400).json({ error: "Envie pelo menos um campo ou o arquivo 'logo'." });
      }

      const updated = await editInfo(info_id, updateFields);

      if (!updated) {
        return res.status(404).json({ error: "Info da empresa não encontrada para este info_id." });
      }

      return res.status(200).json({
        message: "Info da empresa atualizada com sucesso",
        info: updated,
      });
    }
  } catch (err) {
    return res.status(500).json({ error: "Erro ao atualizar info da empresa", details: err.message });
  }
});

// Editar dados de contato das empresas
app.put('/empresas/contato/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { user_id, telefone, email, facebook, instagram, linkedin, twitter } = req.body;

    if (!user_id || !telefone || !email) return res.status(400).json({ error: "Campos obrigatórios estão faltando." });

    const patterns = {
      facebook: /^https:\/\/(www\.)?facebook\.com\/[^\/]+\/?$/i,
      instagram: /^https:\/\/(www\.)?instagram\.com\/[^\/]+\/?$/i,
      linkedin: /^https:\/\/(www\.)?linkedin\.com\/[^\/]+\/?$/i,
      twitter: /^https:\/\/(www\.)?(twitter\.com|x\.com)\/[^\/]+\/?$/i
    };

    const validateUrl = (url, pattern, name) => {
      if (url && !pattern.test(url)) {
        return `URL inválida para ${name}`;
      }
      return null;
    };

    const errors = [
      validateUrl(facebook, patterns.facebook, "Facebook"),
      validateUrl(instagram, patterns.instagram, "Instagram"),
      validateUrl(linkedin, patterns.linkedin, "LinkedIn"),
      validateUrl(twitter, patterns.twitter, "Twitter/X"),
    ].filter(Boolean);

    if (errors.length > 0) {
      return res.status(400).json({ error: errors });
    }

    const resultado = await editContact(id, user_id, telefone, email, facebook, instagram, linkedin, twitter);

    if (resultado) {
      res.status(200).json({ message: "Dados de contato editados com sucesso."});
    } else {
      res.status(404).json({ error: "Dados de contato não encontrados." });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Erro ao editar dados de contato da empresa." });
  }
})

//DELETE

// Excluir dados básicos das empresas
app.delete('/empresas/info/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
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
});

app.delete('/empresas/contato/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) return res.status(400).json({ error: "ID da empresa é obrigatório." });

    const result = await deleteContact(id);

    if (result) {
      res.status(200).json({ message: "Dados de contato excluídos com sucesso." });
    } else {
      res.status(404).json({ error: "Dados de contato não encontrados." });
    }
  } catch (err) {
    res.status(500).json({ error: "Erro ao excluir dados de contato da empresa:", error: err.message });
  }
})

app.listen(8080, () => console.log('Servidor rodando na porta 8080 💻🛞🚪'));