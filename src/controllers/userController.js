const userModel = require('../models/userModel')

const {
    SESSION_TOKEN_COOKIE,
    USER_ID_COOKIE,
} = require('../middleware/sessionManager')

const cookieSettings = { maxAge: 1000 * 60 * 30 }

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
    userModel
        .newUser({ handle: req.body.handle })
        .then(async (result) => {
            const user = await userModel.getUserByIdRisky(result.insertedId)
            console.log('created new horse:', JSON.stringify(user))

            res.cookie(SESSION_TOKEN_COOKIE, user.session, cookieSettings)
            res.cookie(USER_ID_COOKIE, user._id, cookieSettings)

            res.redirect('/')
        })
        .catch((error) => res.status(300).redirect('/register'))
}

async function getLogin(req, res) {
    res.render('pages/login', { sessionData: null })
}

async function postLogin(req, res) {
    let user = await userModel.getUserByHandle(req.body.handle)
    if (!user) {
        res.status(300).redirect('/login')
        return
    }

    await userModel.resetUserSession(user._id)
    user = await userModel.getUserByIdRisky(user._id)
    res.cookie(SESSION_TOKEN_COOKIE, user.session, cookieSettings)
    res.cookie(USER_ID_COOKIE, user._id, cookieSettings)
    res.redirect('/')
}

async function getLogout(req, res) {
    res.clearCookie(SESSION_TOKEN_COOKIE)
    res.clearCookie(USER_ID_COOKIE)
    res.redirect('/')
}

async function getProfile(req, res) {
    if (!req.authenticated) return res.redirect('/')

    const user = await userModel.getUserByHandle(req.params.handle)

    res.render('pages/profile', { user, sessionData: req.sessionData })
}

async function getEditUser(req, res) {
    if (!req.authenticated || req.user?.handle !== req.params.handle)
        return res.redirect('/')

    // todo
    const user = await userModel.getUserByHandle(req.params.handle)
    res.redirect('/')
}

async function postEditUser(req, res) {
    if (!req.authenticated || req.user?.handle !== req.params.handle)
        return res.redirect('/')

    // todo
    const handle = req.params.handle
    res.redirect('/')
}

async function postDeleteUser(req, res) {
    if (!req.authenticated || req.user?.handle !== req.params.handle)
        return res.redirect('/')

    await userModel.deleteUser(req.user._id)
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
