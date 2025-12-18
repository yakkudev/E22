const model = require('../models/userModel')

const {
    SESSION_TOKEN_COOKIE,
    USER_ID_COOKIE,
} = require('../middleware/sessionManager')

// todo: fix ts ugly mess
async function getRoot(req, res) {
    if (!req.authenticated) {
        res.clearCookie(SESSION_TOKEN_COOKIE)
        res.clearCookie(USER_ID_COOKIE)
        return res.redirect('/register')
    }

    res.redirect(`/horse/${req.user.handle}`)
}

async function getRegister(req, res) {
    res.render('pages/landing', { sessionData: null })
}

async function postRegister(req, res) {
    const newId = (await model.newUser({ handle: req.body.handle }))?.insertedId
    if (!newId) {
        return res.status(300).redirect('/register')
    }

    const user = await model.getUserByIdRisky(newId)
    console.log('created new horse:', JSON.stringify(user))

    res.cookie(SESSION_TOKEN_COOKIE, user.session, { maxAge: 1000 * 60 * 10 })
    res.cookie(USER_ID_COOKIE, user._id, { maxAge: 1000 * 60 * 10 })
    res.redirect('/')
}

async function getLogin(req, res) {
    res.render('pages/login', { sessionData: null })
}

async function postLogin(req, res) {
    let user = await model.getUserByHandle(req.body.handle)
    if (!user) {
        res.status(300).redirect('/login')
        return
    }

    await model.resetUserSession(user._id)
    // get new session
    user = await model.getUserByIdRisky(user._id)
    res.cookie(SESSION_TOKEN_COOKIE, user.session, { maxAge: 1000 * 60 * 10 })
    res.cookie(USER_ID_COOKIE, user._id, { maxAge: 1000 * 60 * 10 })
    res.redirect('/')
}

async function getLogout(req, res) {
    res.clearCookie(SESSION_TOKEN_COOKIE)
    res.clearCookie(USER_ID_COOKIE)
    res.redirect('/')
}

async function getProfile(req, res) {
    if (!req.authenticated) return res.redirect('/')

    const user = await model.getUserByHandle(req.params.handle)

    res.render('pages/profile', { user, sessionData: req.session })
}

async function getEditUser(req, res) {
    if (!req.authenticated || !req.user?.handle !== req.params.handle)
        return res.redirect('/')

    // todo
    const user = await model.getUserByHandle(req.params.handle)
    res.redirect('/')
}

async function postEditUser(req, res) {
    if (!req.authenticated || !req.user?.handle !== req.params.handle)
        return res.redirect('/')

    // todo
    const handle = req.params.handle
    res.redirect('/')
}

async function postDeleteUser(req, res) {
    if (!req.authenticated || req.user?.handle !== req.params.handle)
        return res.redirect('/')

    await model.deleteUser(req.user._id)
    res.redirect('/logout')
}

module.exports = {
    getRoot,
    getRegister,
    postRegister,
    getLogin,
    postLogin,
    getLogout,
    getProfile,
    getEditUser,
    postEditUser,
    postDeleteUser,
}
