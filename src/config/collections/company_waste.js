const { connectToDb, getDb, ObjectId } = require('../database.js');
const collection = 'company_waste';

const createWaste = async (user_id, wastes) => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_waste = db.collection(collection);

        const data = {
            user_id: user_id,
            wastes: wastes
        };

        await collection_waste.insertOne(data);
        return data;
    } catch (err) {
        console.error(err)
    }
}

const editWaste = async (id, wastes) => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_waste = db.collection(collection);

        if (!ObjectId.isValid(id)) {
            return false;
        }

        const result = await collection_waste.updateOne(
            { _id: new ObjectId(id) },
            { $set: {
                wastes: wastes
            } 
        });
        return result.modifiedCount > 0;
    } catch (err) {
        console.error(err)
    }
}

const deleteWaste = async (id) => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_waste = db.collection(collection);

        const result = await collection_waste.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    } catch (err) {
        console.error(err)
    }
}

const getWastes = async () => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_waste = db.collection(collection);

        const wastes = await collection_waste.find().toArray()

        if (wastes.length === 0) {
            console.log("Nenhum documento foi encontrado.");
            return
        }

        return wastes
    } catch (err) {
        console.error(err);
    }
}

const findWaste = async (id) => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_waste = db.collection(collection);

        if (!ObjectId.isValid(id)) {
            console.log("ID fornecido é inválido.");
            return null;
        }

         try {
            objectId = ObjectId.createFromHexString(id);
        } catch (error) {
            objectId = null;
        }

        const waste = await collection_waste.findOne({ _id: objectId });

        if (!waste) {
            console.log("Nenhum documento foi encontrado.");
            return null;
        }

        return waste
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    createWaste,
    editWaste,
    deleteWaste,
    getWastes,
    findWaste
}