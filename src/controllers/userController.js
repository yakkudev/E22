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

        return res.status(403).redirect('/register')
    }

    res.status(300).redirect(`/horse/${req.user.handle}`)
}

async function getRegister(req, res) {
    if (req.authenticated) return res.status(300).redirect('/')
    res.status(200).render('pages/landing', { sessionData: null })
}

async function getLogin(req, res) {
    if (req.authenticated) return res.status(300).redirect('/')
    res.status(200).render('pages/login', { sessionData: null })
}

async function postRegister(req, res) {
    const handle = req.body?.handle
    const password = req.body?.password
    let result = await userModel.validateHandle(handle)
    if (!password)
        result.errors = [...(result.errors ?? []), 'Password not provided']
    if (result.errors) return res.status(400).json({ errors: result.errors })

    const hashedPassword = userModel.hashPassword(password)

    userModel
        .newUser({ handle, hashedPassword })
        .then(async (result) => {
            const user = await userModel.getUserByIdRisky(result.insertedId)
            console.log('created new horse:', JSON.stringify(user))

            res.cookie(SESSION_TOKEN_COOKIE, user.session, cookieSettings)
            res.cookie(USER_ID_COOKIE, user._id, cookieSettings)

            res.status(200).json({})
        })
        .catch((error) => res.status(400).json({ errors: [error] }))
}

async function postLogin(req, res) {
    let errors = []
    const handle = req.body?.handle
    const password = req.body?.password

    if (!handle) errors = [...errors, 'Handle not provided']
    if (!password) errors = [...errors, 'Password not provided']

    if (errors.length) return res.status(400).json({ errors })

    const hashedPassword = userModel.hashPassword(password)
    let user = await userModel.getUserByHandleRisky(handle)
    if (!user || user?.hashedPassword !== hashedPassword) {
        errors = [...errors, 'Invalid handle or password']
    }
    if (errors.length) return res.status(400).json({ errors })

    await userModel.resetUserSession(user._id)
    user = await userModel.getUserByIdRisky(user._id)
    res.cookie(SESSION_TOKEN_COOKIE, user.session, cookieSettings)
    res.cookie(USER_ID_COOKIE, user._id, cookieSettings)
    res.status(200).json()
}

async function postValidateHandle(req, res) {
    const handle = req.body?.handle
    const result = await userModel.validateHandle(handle)
    if (result.errors) return res.status(400).json({ errors: result.errors })

    return res.status(200).json()
}

async function getLogout(req, res) {
    res.clearCookie(SESSION_TOKEN_COOKIE)
    res.clearCookie(USER_ID_COOKIE)
    res.status(300).redirect('/')
}

async function getProfile(req, res, next) {
    if (!req.authenticated) return res.status(403).redirect('/')

    const user = await userModel.getUserByHandle(req.params.handle)
    if (!user) return next()

    res.status(200).render('pages/profile', {
        user,
        sessionData: req.sessionData,
    })
}

async function getEditUser(req, res) {
    if (!req.authenticated || req.user?.handle !== req.params.handle)
        return res.status(403).redirect('/')

    // todo
    const user = await userModel.getUserByHandle(req.params.handle)
    res.status(300).redirect('/')
}

async function postEditUser(req, res) {
    if (!req.authenticated || req.user?.handle !== req.params.handle)
        return res.status(403).redirect('/')

    // todo
    const handle = req.params.handle
    res.status(300).redirect('/')
}

async function postDeleteUser(req, res) {
    if (!req.authenticated || req.user?.handle !== req.params.handle)
        return res.status(403).redirect('/')

    await userModel.deleteUser(req.user._id)
    res.status(300).redirect('/logout')
}

module.exports = {
    api: {
        postRegister,
        postLogin,
        postValidateHandle,
    },
    getRoot,
    getRegister,
    getLogin,
    getLogout,
    getProfile,
    getEditUser,
    postEditUser,
    postDeleteUser,
}
