const crypto = require('crypto')
const { ObjectId } = require('mongodb')
const { getDB } = require('../data/connection')

const fromUsers = () => getDB().collection('users')
const fromPosts = () => getDB().collection('posts')

const generateSessionToken = () => crypto.randomUUID()

async function validateHandle(handle) {
    if (!handle)
        return {
            errors: ['Handle not provided'],
        }
    const regex = /^[A-Za-z0-9_-]{3,16}$/
    if (!regex.test(handle))
        return {
            errors: [
                'Handle does not match format (3-16 alphanum characters, with _-)',
            ],
        }

    let user = await getUserByHandle(handle)
    if (user)
        return {
            errors: [
                'Horse with this handle already exists, maybe try to log in?',
            ],
        }

    return {}
}

function hashPassword(password) {
    const hash = crypto.createHash('sha256')
    hash.update(password)
    return hash.digest('hex')
}

async function getUserById(userId) {
    return await fromUsers().findOne(
        { _id: new ObjectId(userId) },
        { $unset: { session: 0, hashedPassword: 0 } }
    )
}

// risky functions dont omit ANY DATA (incl session token and password hash)
async function getUserByIdRisky(userId) {
    return await fromUsers().findOne({ _id: new ObjectId(userId) })
}

async function getUserByHandleRisky(handle) {
    return await fromUsers().findOne({ handle })
}

async function getAllUsers() {
    return await fromUsers()
        .find()
        .sort({ handle: -1 }, { $unset: { session: 0, hashedPassword: 0 } })
        .toArray()
}

async function getUserByHandle(handle) {
    return await fromUsers().findOne(
        { handle },
        { $unset: { session: 0, hashedPassword: 0 } }
    )
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
async function newUser({ handle, hashedPassword }) {
    if (!(await getUserByHandle(handle))) {
        const session = generateSessionToken()
        return await fromUsers().insertOne({ handle, hashedPassword, session })
    }
    throw new Error(
        'Horse with this handle already exists. Maybe try to log in?'
    )
}

async function deleteUser(userId) {
    await fromPosts().deleteMany({ userId: new ObjectId(userId) })
    return await fromUsers().deleteOne({ _id: new ObjectId(userId) })
}

module.exports = {
    validateHandle,
    hashPassword,
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
