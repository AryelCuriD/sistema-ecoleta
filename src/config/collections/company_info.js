const { connectToDb, getDb, ObjectId } = require('../database.js');
const collection = 'company_info';

async function cleanupOrphanGridFS() {
  await connectToDb();
  const db = getDb();

  const infoCol = db.collection("company_info");
  const filesCol = db.collection("uploads.files");
  const chunksCol = db.collection("uploads.chunks");

  const infos = await infoCol
    .find(
      { logo: { $exists: true, $ne: null } },
      { projection: { logo: 1 } }
    )
    .toArray();

  const usedLogoIds = infos
    .map(d => d.logo)
    .filter(Boolean)
    .map(id => (typeof id === "string" ? new ObjectId(id) : id));

  if (usedLogoIds.length === 0) {
    await chunksCol.deleteMany({});
    await filesCol.deleteMany({});
    return { deletedFiles: "ALL", deletedChunks: "ALL" };
  }

  const orphanFiles = await filesCol
    .find(
      { _id: { $nin: usedLogoIds } },
      { projection: { _id: 1 } }
    )
    .toArray();

  const orphanFileIds = orphanFiles.map(f => f._id);

  let chunksResult = { deletedCount: 0 };
  if (orphanFileIds.length > 0) {
    chunksResult = await chunksCol.deleteMany({ files_id: { $in: orphanFileIds } });
  }

  let filesResult = { deletedCount: 0 };
  if (orphanFileIds.length > 0) {
    filesResult = await filesCol.deleteMany({ _id: { $in: orphanFileIds } });
  }

  const existingFiles = await filesCol.find({}, { projection: { _id: 1 } }).toArray();
  const existingFileIds = existingFiles.map(f => f._id);

  const orphanChunksResult = await chunksCol.deleteMany({
    files_id: { $nin: existingFileIds },
  });

  return {
    deletedChunksFromOrphanFiles: chunksResult.deletedCount,
    deletedOrphanFiles: filesResult.deletedCount,
    deletedChunksWithoutParentFile: orphanChunksResult.deletedCount,
  };
}

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
    
    await cleanupOrphanGridFS();

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