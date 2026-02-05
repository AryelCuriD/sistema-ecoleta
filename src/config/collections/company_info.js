const { connectToDb, getDb, ObjectId } = require('../database.js');
const collection = 'company_info';

const findCompany = async () => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_empresas = bd.collection(collection);
    const find = await collection_empresas.findOne()

    if (find.length === 0) {
      console.log("Nenhum documento foi encontrado.");
      return null; 
    }

    return find;

  } catch (err) {
    console.error("Erro ao encontrar empresa:", err.message);
    throw err;
  }
};

const createInfo = async (nome_empresa, cnpj, razao_social, logo, descricao) => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_empresas = bd.collection(collection);
  
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

const deleteInfo = async (id) => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_empresas = bd.collection(collection);

    const resultado = await collection_empresas.deleteOne({ _id: new ObjectId(id) });
    return resultado.deletedCount > 0;
  } catch (err) {
    console.error("Erro ao excluir dados de identificação da empresa:", err.message);
    throw err;
  }
};

const editInfo = async (id, updatedData) => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_empresas = bd.collection(collection);

    const resultado = await collection_empresas.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    
    return resultado.modifiedCount > 0;
  } catch (err) {
    console.error("Erro ao editar dados de identificação da empresa:", err.message);
    throw err;
  }
}

module.exports = {
  findCompany: findCompany,
  createInfo: createInfo,
  deleteInfo: deleteInfo,
  editInfo: editInfo
};