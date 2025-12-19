const postModel = require('../models/postModel')
const userModel = require('../models/userModel')

async function getEditPost(req, res, next) {
    if (!req.authenticated) return res.status(403).redirect('/')
    try {
        const post = await postModel.getPostById(req.params.post)
        const user = await userModel.getUserById(post.userId)

        if (!user || !post) return next()

        if (!req.user?._id.equals(post.userId))
            return res.status(403).redirect('/')

        return res.status(200).render('pages/editPost', {
            postData: { post, user },
            sessionData: req.sessionData,
        })
    } catch (error) {
        return next()
    }
}

async function getPostShort(req, res, next) {
    if (!req.authenticated) return res.status(403).redirect('/')
    try {
        const post = await postModel.getPostById(req.params.post)
        const user = await userModel.getUserById(post.userId)

        if (!user || !post) return next()

        return res
            .status(300)
            .redirect(`/horse/${user.handle}/post/${post._id}`)
    } catch (error) {
        return next()
    }
}

// todo: maybe make this code more readable
async function getPostView(req, res, next) {
    if (!req.authenticated) return res.status(403).redirect('/')

    try {
        const post = await postModel.getPostById(req.params.post)
        const user = await userModel.getUserByHandle(req.params.handle)

        if (!user || !post || !post?.userId.equals(user?._id)) return next()

        return res.status(200).render('pages/post', {
            postData: { post, user },
            sessionData: req.sessionData,
        })
    } catch (error) {
        return next()
    }
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

    if (!req.body.content || req.body.content?.length === 0)
        return res.status(400).json()

    const post = await postModel.newPost({
        userId: req.user._id,
        content: req.body.content,
    })
    if (!post) {
        return res.status(500).json()
    }
    return res.status(200).json({ postId: post.insertedId })
}

async function postReplyPost(req, res) {
    if (!req.authenticated) return res.status(403).json()

    if (!req.body.content || req.body.content?.length === 0)
        return res.status(400).json()

    let replyTo
    try {
        replyTo = await postModel.getPostById(req.params.post)
        if (!replyTo) return res.status(404).json()
    } catch (error) {
        return res.status(500).json()
    }

    const post = await postModel.newPost({
        userId: req.user._id,
        content: req.body.content,
        replyTo: replyTo._id,
    })

    if (!post) return res.status(500).json()

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

async function postEditPost(req, res) {
    if (!req.body.content || req.body.content?.length === 0)
        return res.status(400).json()
    try {
        const post = await postModel.getPostById(req.params.post)

        if (!req.authenticated || !req.user?._id.equals(post?.userId))
            return res.status(403).json()
    } catch (error) {
        return res.status(500).json()
    }

    await postModel.editPost(req.params.post, req.body.content)
    res.status(200).json()
}

module.exports = {
    getPostView,
    getPostShort,
    getEditPost,
    api: {
        getPost,
        postNewPost,
        postDeletePost,
        postEditPost,
        postReplyPost,
    },
}
