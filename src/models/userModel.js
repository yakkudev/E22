const { ObjectId } = require('mongodb')
const { getDB } = require('../data/connection')

const fromUsers = () => getDB().collection('users')

const generateSessionToken = () => crypto.randomUUID()

async function getUserById(userId) {
    return await fromUsers().findOne(
        { _id: new ObjectId(userId) },
        { $unset: { session: 0 } }
    )
}

// risky functions dont omit ANY DATA (incl session token)
async function getUserByIdRisky(userId) {
    return await fromUsers().findOne({ _id: new ObjectId(userId) })
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

async function resetUserSession(userId) {
    const session = generateSessionToken()
    return await fromUsers().updateOne(
        { _id: new ObjectId(userId) },
        { $set: { session } }
    )
}

async function pushPostId(userId, postId) {
    // the syntax is a bit akward but it just pushes the postId
    // to the start of the array instead of the end
    return await fromUsers().updateOne(
        { _id: new ObjectId(userId) },
        { $push: { posts: { $each: [new ObjectId(postId)], $position: 0 } } }
    )
}

async function deletePostId(userId, postId) {
    return await fromUsers().updateOne(
        { _id: new ObjectId(userId) },
        { $pull: { posts: new ObjectId(postId) } }
    )
}

// todo password
async function newUser({ handle }) {
    if (!(await getUserByHandle(handle))) {
        const session = generateSessionToken()
        return await fromUsers().insertOne({ handle, session })
    }
    throw new Error('User with this handle already exists')
}

async function deleteUser(userId) {
    return await fromUsers().deleteOne({ _id: new ObjectId(userId) })
}

module.exports = {
    getAllUsers,
    getUserById,
    getUserByIdRisky,
    getUserByHandle,
    getUserByHandleRisky,
    resetUserSession,
    pushPostId,
    deletePostId,
    newUser,
    deleteUser,
}
