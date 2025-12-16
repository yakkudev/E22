const { ObjectId } = require('mongodb')
const { getDB } = require('../data/connection')

const fromUsers = () => getDB().collection('users')

const generateSessionToken = () => crypto.randomUUID()

// risky functions dont omit ANY DATA (incl session token)
async function getUserByIdRisky(id) {
    return await fromUsers().findOne({ _id: new ObjectId(id) })
}

async function getUserByHandleRisky(handle) {
    return await fromUsers().findOne({ handle })
}

async function getAllUsers() {
    return await fromUsers()
        .find()
        .sort({ handle: -1 }, { $unset: { session: 0 } })
        .toArray()
}

async function getUserByHandle(handle) {
    return await fromUsers().findOne({ handle }, { $unset: { session: 0 } })
}

async function resetUserSession(id) {
    const session = generateSessionToken()
    return await fromUsers().updateOne(
        { _id: new ObjectId(id) },
        { $set: { session } }
    )
}

async function newUser({ handle }) {
    if (!(await getUserByHandle(handle))) {
        const session = generateSessionToken()
        return await fromUsers().insertOne({ handle, session })
    }
    return null
}

async function deleteUser(id) {
    return await fromUsers().deleteOne({ _id: new ObjectId(id) })
}

module.exports = {
    getAllUsers,
    getUserByIdRisky,
    getUserByHandle,
    getUserByHandleRisky,
    resetUserSession,
    newUser,
    deleteUser,
}
