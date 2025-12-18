const postModel = require('../models/postModel')
const userModel = require('../models/userModel')

const {
    SESSION_TOKEN_COOKIE,
    USER_ID_COOKIE,
} = require('../middleware/sessionManager')

// todo: maybe make this code more readable
async function getPostView(req, res) {
    if (!req.authenticated) return res.status(403).redirect('/')

    let post
    let user
    try {
        post = await postModel.getPostById(req.params.post)
        user = await userModel.getUserByHandle(req.params.handle)
        if (!user || !post || !post?.userId.equals(user?._id))
            return res.status(404).redirect(`/horse/${req.params.handle}`)
    } catch (error) {
        return res.status(500).send()
    }

    res.status(200).render('pages/post', {
        postData: { post, user },
        sessionData: req.sessionData,
    })
}

async function getPost(req, res) {
    let post
    let user
    try {
        post = await postModel.getPostById(req.params.post)
        if (!post) return res.status(404).json()

        user = await userModel.getUserById(post.userId)
    } catch (error) {
        return res.status(500).json()
    }

    res.status(200).json({ post, user })
}

async function postNewPost(req, res) {
    if (!req.authenticated) return res.status(403).json()

    const post = await postModel.newPost({
        userId: req.user._id,
        content: req.body.content,
    })
    if (!post) {
        return res.status(500).json()
    }
    return res.status(200).json({ postId: post.insertedId })
}

async function postDeletePost(req, res) {
    try {
        const post = await postModel.getPostById(req.params.post)

        if (!req.authenticated || !req.user?._id.equals(post?.userId))
            return res.status(403).json()
    } catch (error) {
        return res.status(500).json()
    }

    await postModel.deletePost(req.params.post)
    res.status(200).json()
}

module.exports = {
    getPostView,
    api: {
        getPost,
        postNewPost,
        postDeletePost,
    },
}
