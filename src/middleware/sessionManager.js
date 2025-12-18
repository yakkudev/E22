const model = require('../models/userModel')

const SESSION_TOKEN_COOKIE = 'SESSION_TOKEN'
const USER_ID_COOKIE = 'USER_ID'

const manageSession = async (req, res, next) => {
    req.authenticated = false

    const sessionToken = req.cookies[SESSION_TOKEN_COOKIE]
    const userId = req.cookies[USER_ID_COOKIE]
    if (!sessionToken || !userId) {
        return next()
    }
    const user = await model.getUserByIdRisky(userId)
    if (!user || sessionToken !== user?.session) {
        return next()
    }

    req.authenticated = true
    req.user = user
    req.sessionData = {
        token: sessionToken,
        handle: user.handle,
        userId: userId,
    }
    next()
}

const sessionManager = () => manageSession

module.exports = { sessionManager, SESSION_TOKEN_COOKIE, USER_ID_COOKIE }
