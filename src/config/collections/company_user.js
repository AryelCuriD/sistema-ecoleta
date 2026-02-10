const { connectToDb, getDb, ObjectId } = require('../database.js');
const collection = 'company_users';

const findUser = async (id) => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_users = bd.collection(collection);

    if (!ObjectId.isValid(id)) {
      console.log("ID fornecido é inválido.");
      return null;
    }
    try {
      objectId = ObjectId.createFromHexString(id);
    } catch (error) {
      objectId = null;
    }
    const user = await collection_users.findOne({ _id: objectId});

    if (!user) {
      console.log("Nenhum documento foi encontrado.");
      return null;
    }

    console.log("Usuário encontrado:", user);
    return user;

  } catch (err) {
    console.error("Erro ao encontrar usuário:", err.message);
    throw err;
  }
}

const registerCompany = async (email, password) => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_users = bd.collection(collection);
  
    const newData = {
      email: email,
      password: password
    }
    await collection_users.insertOne(newData);
    return newData;
  } catch (err) {
    console.error("Erro ao inserir novo usuário:", err.message);
    throw err;
  }
};

const getUsers = async () => {
  try {
    await connectToDb();
    const db = getDb();
    const collectionUsers = db.collection(collection);
    const users = await collectionUsers.find().toArray()

    if (users.length === 0) {
      console.log("Nenhum documento foi encontrado.");
      return; 
    }

    return users;

  } catch (err) {
    console.error("Erro ao buscar usuários:", err.message);
    throw err;
  }
};


module.exports = {
  findUser,
  registerCompany,
  getUsers
}