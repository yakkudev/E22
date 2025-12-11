const { ObjectId } = require('mongodb');
const { getDB } = require('../data/connection');

const fromUsers = () => getDB().collection('users');

const generateSessionToken = () => crypto.randomUUID();

// unsafe functions dont exclude session token
async function getUserByIdUnsafe(id) {
    return await fromUsers().findOne({ _id: new ObjectId(id) });
}

async function getUserByHandleUnsafe(handle) {
    return await fromUsers().findOne({ handle });
}

async function getAllUsers() {
    return await fromUsers().find().sort({ handle: -1 }, { $unset: { session: 0 } }).toArray();
}

async function getUserByHandle(handle) {
    return await fromUsers().findOne({ handle }, { $unset: { session: 0 } });
}

async function resetUserSession(id) {
    const session = generateSessionToken();
    return await fromUsers().updateOne({ _id: new ObjectId(id) }, { $set: { session } });
}

async function newUser({ handle }) {
    if (!await getUserByHandle(handle)){
        const session = generateSessionToken();
        return await fromUsers().insertOne({ handle, session });
    }
    return null;
}

async function deleteUser(id) {
    return await fromUsers().deleteOne({ _id: new ObjectId(id) });
}

module.exports = { getAllUsers, getUserByIdUnsafe, getUserByHandle, getUserByHandleUnsafe, resetUserSession, newUser, deleteUser };