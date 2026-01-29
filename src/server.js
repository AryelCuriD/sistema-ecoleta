const express = require('express');
const multer = require('multer');
const GridFSBucket = require('mongodb');
const { connectToDb, getDb, client } = require('./database.js');
const {encontrarEmpresa, criarDadosDeIdentificacao} = require('./config/database_empresas.js');
const bd = getDb();

const upload = multer({ storage: multer.memoryStorage() });
const bucket = new GridFSBucket(bd, { bucketName: "images" });

await connectToDb();
    
const app = express();
app.use(express.json());

app.get('/empresas/dados', async (req, res) => {
    try{
        const getEmpresas = await encontrarEmpresa();
        res.status(201).json(getEmpresas);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Erro ao pegar os dados" });
    }
})

app.post('/empresas/dados-de-identificacao', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).send('Envie um arquivo de imagem');

  try {
    const { nome_empresa, cnpj, razao_social, logo, descricao } = req.body

    const uploadStream = bucket.openUploadStream(logo, {
      contentType: req.file.mimetype,
      metadata: { uploadedAt: new Date() },
    });

    const dadosDeIdentificacao = await criarDadosDeIdentificacao( nome_empresa, cnpj, razao_social, uploadStream, descricao);
    console.log(dadosDeIdentificacao);

    
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Erro ao criar dados de identificação da empresa' })
  }
})

app.listen(8080, () => console.log('Servidor rodando na porta 8080 💻🛞🚪'));