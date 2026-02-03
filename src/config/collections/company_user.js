const { connectToDb, getDb, ObjectId } = require('../database.js');
const collection = 'company_users';

const registerCompany = async (email, password) => {
  try {
    await connectToDb();
    const bd = getDb();
    const collection_users = bd.collection(collection);
  
    const newData = {
      email: email,
      password: password
    }
    const result = await collection_users.insertOne(newData);
    return newData;
  } catch (err) {
    console.error("Erro ao inserir dados de identificação:", err.message);
    throw err;
  }
};

const getUsers = async () => {
  try {
    await connectToDb();
    const db = getDb();
    const collectionUsers = db.collection(collection);

    const docs = await collectionUsers.find().toArray();

    if (docs.length === 0) {
      console.log("Nenhum usuário encontrado.");
      return [];
    }

    const USERS = docs.map((user, index) => ({
      id: index + 1,
      username: user.email,
      email: user.email,
      password: user.password,
    }));

    return USERS;

  } catch (err) {
    console.error("Erro ao buscar usuários:", err.message);
    throw err;
  }
};


module.exports = {
    registerCompany,
    getUsers
}