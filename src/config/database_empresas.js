const { connectToDb, getDb, ObjectId } = require('./database.js');

const encontrarEmpresa = async () => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_empresas = bd.collection("empresas");
    const encontrar = await collection_empresas.find().toArray();
    if (encontrar.length === 0) {
      console.log("Nenhum documento foi encontrado.");
      return null; 
    }
    console.log(encontrar)
    return encontrar;
  } catch (err) {
    console.error("Erro ao encontrar tecnico:", err.message);
    throw err;
  }
};

const criarDadosDeIdentificacao = async (nome_empresa, cnpj, razao_social, logo, descricao) => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_empresas = bd.collection("empresas");
  
    const novosDados = {
      nome_empresa: nome_empresa,
      cnpj: cnpj,
      razao_social: razao_social,
      logo: logo,
      descricao: descricao
    }
    const resultado = await collection_empresas.insertOne(novosDados);
    return novosDados;
  } catch (err) {
    console.error("Erro ao inserir dados de identificação:", err.message);
    throw err;
  }
};



module.exports = { encontrarEmpresa, criarDadosDeIdentificacao };