const { connectToDb, getDb, ObjectId } = require('../database.js');
const collection = 'company_contact';

const createContact = async (user_id, telefone, email, facebook, instagram, linkedin, twitter) => {
    try {
        await connectToDb();
        const bd = getDb();
        const collection_contact = bd.collection(collection);

        // ver as redes sociais depois
        const newData = {
            user_id: user_id,
            telefone: telefone,
            email: email,

            social_media: {
                facebook: facebook,
                instagram: instagram,
                linkedin: linkedin,
                twitter: twitter
            }         
        };

        await collection_contact.insertOne(newData);
        return newData;
    } catch (err) {
        console.error("Erro ao criar dados de contato da empresa:", err.message);
    }
}

const getContacts = async () => {
    try {
        await connectToDb();
        const db = getDb();
        const collectionContact = db.collection(collection);
        const contacts = await collectionContact.find().toArray()

        if (contacts.length === 0) {
            console.log("Nenhum documento foi encontrado.");
            return
        }

        return contacts;
    } catch (err) {
        console.error("Erro ao pegar dados de contato das empresas:", err.message);
        throw err;
    }
}

const findContact = async (id) => {
    try {
        await connectToDb();
        const db = getDb();
        const collectionContact = db.collection(collection);

        if (!ObjectId.isValid(id)) {
            console.log("ID fornecido é inválido.");
            return null;
        }

        try {
            objectId = ObjectId.createFromHexString(id);
        } catch (error) {
            objectId = null;
        }

        const contact = await collectionContact.findOne({ _id: objectId});

        if (!contact) {
            console.log("Nenhum documento foi encontrado.");
            return null;
        }

        return contact;
    } catch (err) {
        console.error("Erro ao pegar dados de contato da empresa:", err.message);
        throw err;
    }
}

const editContact = async (id, user_id, telefone, email, facebook, instagram, linkedin, twitter) => {
    try {
        await connectToDb();
        const db = getDb();
        const collectionContact = db.collection(collection);
        
        const result = await collectionContact.updateOne(
            { _id: new ObjectId(id) },

            { $set: {
                user_id: user_id,
                telefone: telefone,
                email: email,
                social_media: {
                    facebook: facebook,
                    instagram: instagram,
                    linkedin: linkedin,
                    twitter: twitter
                }
            }}
        );
        
        return result.modifiedCount > 0;
    } catch (err) {
        console.error("Erro ao editar dados de contato da empresa:", err.message);
        throw err;
    }
}

const deleteContact = async (id) => {
    try {
        await connectToDb();
        const db = getDb();
        const collectionContact = db.collection(collection);

        const result = await collectionContact.deleteOne({ _id: new ObjectId(id) });
        return result.deletedCount > 0;
    } catch (err) {
        console.error("Erro ao excluir dados de contato da empresa:", err.message);
        throw err;
    }
}

module.exports = {
    createContact,
    getContacts,
    findContact,
    editContact,
    deleteContact
}