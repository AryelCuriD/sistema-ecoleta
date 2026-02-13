const { connectToDb, getDb, ObjectId } = require('../database.js');
const collection = 'company_points';

const createPoints = async (user_id, points) => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_points = db.collection(collection);

        const data = {
            user_id: user_id,
            points: points
        }

        await collection_points.insertOne(data);
        return data;
    } catch (err) {
        console.error(err);
    }
}

const editPoints = async (id, points) => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_points = db.collection(collection);

        if (!ObjectId.isValid(id)) {
            return false;
        }

        const result = await collection_points.updateOne(
            { _id: new ObjectId(id) },
            { $set: {
                points: points
            }
        });
        return result.modifiedCount > 0;
    } catch (err) {
        console.error(err)
    }
}

const deletePoints = async (id) => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_points = db.collection(collection);

        const result = await collection_points.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    } catch (err) {
        console.error(err)
    }
}

const getPoints = async () => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_points = db.collection(collection);

        const allPoints = await collection_points.find().toArray()

        if (allPoints.length === 0) {
            console.log("Nenhum documento foi encontrado.");
            return
        }

        return allPoints
    } catch (err) {
        console.error(err)
    }
}

const findPoints = async (id) => {
    try {
        await connectToDb();
        const db = getDb();
        const collection_points = db.collection(collection);

        if (!ObjectId.isValid(id)) {
            console.log("ID fornecido é inválido.");
            return null;
        }

         try {
            objectId = ObjectId.createFromHexString(id);
        } catch (error) {
            objectId = null;
        }

        const points = await collection_points.findOne({ _id: objectId });

        if (!points) {
            console.log("Nenhum documento foi encontrado.");
            return null;
        }

        return points;
    } catch (err) {
        console.error(err)
    }
}

module.exports = {
    createPoints,
    editPoints,
    deletePoints,
    getPoints,
    findPoints
}