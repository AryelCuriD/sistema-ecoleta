const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const path = require('path');
require('dotenv').config(); 
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  connectTimeoutMS: 100000, 
  socketTimeoutMS: 450000,
  maxPoolSize: 10,
  minPoolSize: 2 
});

let bd;

const connectToDb = async () => {  
  try {
    await client.connect();
    bd = client.db("sistema-ecoleta");
  } catch (err) {
    console.error("Erro ao conectar ao MongoDB:", err);
    throw err; 
  }
};

const closeConnection = async () => {
  await client.close();
};

module.exports = {
  connectToDb,
  closeConnection,
  ObjectId,
  client,
  getDb: () => bd
};