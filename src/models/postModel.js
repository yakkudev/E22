const { ObjectId } = require('mongodb')
const { getDB } = require('../data/connection')
const userModel = require('./userModel')

const fromPosts = () => getDB().collection('posts')

async function getPostById(postId) {
    return await fromPosts().findOne({ _id: new ObjectId(postId) })
}

async function newPost({ userId, content, replyTo }) {
    const postDate = Date.now()

    const res = await fromPosts().insertOne({
        userId,
        content,
        replyTo,
        postDate,
    })
    await userModel.pushPostId(userId, res.insertedId)
    return res
}

async function deletePost(postId) {
    const post = await getPostById(postId)
    await userModel.deletePostId(post.userId, postId)
    return await fromPosts().deleteOne({ _id: new ObjectId(postId) })
}

module.exports = {
    getPostById,
    newPost,
    deletePost,
}
