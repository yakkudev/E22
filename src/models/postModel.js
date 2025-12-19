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
    if (replyTo) await addReply(replyTo, res.insertedId)
    return res
}

async function addReply(postId, replyId) {
    return await fromPosts().updateOne(
        { _id: new ObjectId(postId) },
        { $push: { replies: { $each: [new ObjectId(replyId)], $position: 0 } } }
    )
}

async function deletePost(postId) {
    const post = await getPostById(postId)
    await userModel.deletePostId(post.userId, postId)
    return await fromPosts().deleteOne({ _id: new ObjectId(postId) })
}

async function deletePostsByUser(userId) {
    return await fromPosts().deleteMany({ userId: new ObjectId(userId) })
}

async function editPost(postId, content) {
    return await fromPosts().updateOne(
        { _id: new ObjectId(postId) },
        { $set: { content } }
    )
}

async function searchPosts({ handle, phrase, sortBy }) {
    // https://www.mongodb.com/docs/manual/core/aggregation-pipeline/
    const pipeline = []

    pipeline.push({
        $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
        },
    })
    pipeline.push({ $unwind: '$user' })

    // filter by handle
    if (handle) {
        pipeline.push({
            $match: { 'user.handle': { $regex: handle, $options: 'i' } },
        })
    }

    // filter by phrase
    if (phrase) {
        pipeline.push({
            $match: { content: { $regex: phrase, $options: 'i' } },
        })
    }

    // sort

    // sort by date by ddefualt
    let sortField = { postDate: -1 }
    if (sortBy === 'replies') {
        pipeline.push({
            $addFields: {
                replyCount: { $size: { $ifNull: ['$replies', []] } },
            },
        })
        sortField = { replyCount: -1 }
    } else if (sortBy === 'horse') {
        sortField = { 'user.handle': 1 }
    }
    pipeline.push({ $sort: sortField })

    // ids only
    pipeline.push({ $project: { _id: 1 } })

    return await fromPosts().aggregate(pipeline).toArray()
}

module.exports = {
    getPostById,
    newPost,
    editPost,
    deletePost,
    deletePostsByUser,
    searchPosts,
}
