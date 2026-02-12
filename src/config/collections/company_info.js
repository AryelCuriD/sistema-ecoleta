const { connectToDb, getDb, ObjectId } = require('../database.js');
const collection = 'company_info';

const getInfos = async () => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_empresas = bd.collection(collection);
    const infos = await collection_empresas.find().toArray();

    if (infos.length === 0) {
      console.log("Nenhum documento foi encontrado.");
      return
    }

    return infos;
  } catch (err) {
    console.error("Erro ao pegar dados de identificação das empresas:", err.message);
    throw err;
  }
}

const findCompany = async (id) => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_empresas = bd.collection(collection);

    if (!ObjectId.isValid(id)) {
      console.log("ID fornecido é inválido.");
      return null;
    }
    try {
      objectId = ObjectId.createFromHexString(id);
    } catch (error) {
      objectId = null;
    }
    const info = await collection_empresas.findOne({ _id: objectId});

    if (!info) {
      console.log("Nenhum documento foi encontrado.");
      return null;
    }

    return info;

  } catch (err) {
    console.error("Erro ao encontrar empresa:", err.message);
    throw err;
  }
};

const createInfo = async (user_id, nome_empresa, cnpj, razao_social, logo, descricao) => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_empresas = bd.collection(collection);
    const realIds = bd.collection('company_info').find();
    const logos = realIds.map(doc => doc.logo);
    const files = bd.collection('uploads.files').find();
    const chunks = bd.collection('uploads.chunks').find();

    // verificar os files e chunks com objectids sem relação e excluir

    const newData = {
      user_id: user_id,
      nome_empresa: nome_empresa,
      cnpj: cnpj,
      razao_social: razao_social,
      logo: logo,
      descricao: descricao
    }
    await collection_empresas.insertOne(newData);
    return newData;
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

    if (!ObjectId.isValid(id)) {
      return false;
    }

    const resultado = await collection_empresas.updateOne(
      { _id: new ObjectId(id) },
      { $set: updatedData }
    );
    
    return resultado.modifiedCount > 0;
    return resultado.matchedCount > 0;
  } catch (err) {
    console.error("Erro ao editar dados de identificação da empresa:", err.message);
    throw err;
  }
}

module.exports = {
  getInfos,
  findCompany,
  createInfo,
  deleteInfo,
  editInfo
};