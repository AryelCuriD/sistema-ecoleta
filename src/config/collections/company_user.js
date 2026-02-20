const { connectToDb, getDb, ObjectId } = require('../database.js');
const verifyAuth = require("../../controllers/verifyAuth.js");
const collection = 'company_users';
const bcrypt = require('bcryptjs');

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
  findUserData();
  try {
    await connectToDb();
    const db = getDb();
    const collectionUsers = db.collection(collection);
    const users = await collectionUsers.find().toArray()

    if (users.length === 0) {
      return {}; 
    }

    return users;

  } catch (err) {
    console.error("Erro ao buscar usuários:", err.message);
    throw err;
  }
};

const deleteUser = async (id, email, password) => {
  try {
    await connectToDb();
    const db = getDb();
    const collection_users = db.collection(collection);
    const doc = await collection_users.findOne({ _id: new ObjectId(id) })
    const realEmail = doc.email
    const realPassword = doc.password

    const match = await bcrypt.compare(password, realPassword) && (email === realEmail)
    
    if (match) {
      const result = await collection_users.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0
    }
    return
  } catch (err) {
    console.error(err)
  }
}

const findUserData = async (user) => {
  try {
    await connectToDb();
    const db = getDb();

    const collection_info = db.collection('company_info');
    const collection_contact = db.collection('company_contact');
    const collection_waste = db.collection('company_waste');
    const collection_points = db.collection('company_points');
    const collection_user = db.collection('company_users');

    if (!user || !user["id"]) return;

    const user_id = user["id"]
    
    const company_info = await collection_info.findOne({ user_id });
    const company_contact = await collection_contact.findOne({ user_id });
    const company_waste = await collection_waste.findOne({ user_id });
    const company_points = await collection_points.findOne({ user_id });
    const company_user = await collection_user.findOne({ _id: new ObjectId(user_id) })
    
    return {
      info: company_info,
      contact: company_contact,
      wastes: company_waste,
      points: company_points,
      user: company_user
    }

  } catch (err) {
    console.error(err)
  }
}

module.exports = {
  findUser,
  registerCompany,
  getUsers,
  deleteUser,
  findUserData
}