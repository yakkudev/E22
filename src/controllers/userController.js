const model = require('../models/userModel');

const SESSION_TOKEN_COOKIE = "SESSION_TOKEN";
const USERID_COOKIE = "USER_ID";

const sessionData = (req) => {
    const token = req.cookies[SESSION_TOKEN_COOKIE];
    const userId = req.cookies[USERID_COOKIE];
    if (token && userId) 
        return { token, userId };
    return null;
};

// todo: fix ts ugly mess
async function getRoot(req, res) {
    const session = sessionData(req);
    if (session) {
        const user = await model.getUserByIdUnsafe(session.userId);
        if (user.session === session.token) {
            res.redirect(`/horse/${user.handle}`);
            return;
        }
    }

    res.clearCookie(SESSION_TOKEN_COOKIE);
    res.clearCookie(USERID_COOKIE);
    res.redirect('/register');
}

async function getRegister(req, res) {
    res.render('pages/landing', { sessionData: sessionData(req) });
}

async function postRegister(req, res) {
    const newId = (await model.newUser({ handle: req.body.handle }))?.insertedId;
    if (!newId) {
        res.status(300).redirect('/register');
        return;
    } 

    const user = await model.getUserByIdUnsafe(newId);
    console.log("created new horse:", JSON.stringify(user));
    res.cookie(SESSION_TOKEN_COOKIE, user.session, { maxAge: 1000 * 60 * 10 });
    res.cookie(USERID_COOKIE, user._id, { maxAge: 1000 * 60 * 10 });
    res.redirect('/');
}

async function getLogin(req, res) {
    res.render('pages/login', { sessionData: sessionData(req) });
}

async function postLogin(req, res) {
    let user = await model.getUserByHandle(req.body.handle);
    if (!user) {
        res.status(300).redirect('/login');
        return;
    } 

    await model.resetUserSession(user._id);
    // get new session
    user = await model.getUserByIdUnsafe(user._id);
    res.cookie(SESSION_TOKEN_COOKIE, user.session, { maxAge: 1000 * 60 * 10 });
    res.cookie(USERID_COOKIE, user._id, { maxAge: 1000 * 60 * 10 });
    res.redirect('/');
}

async function getLogout(req, res) {
    res.clearCookie(SESSION_TOKEN_COOKIE);
    res.clearCookie(USERID_COOKIE);
    res.redirect('/');
}

async function getProfile(req, res) {
    const user = await model.getUserByHandle(req.params.handle);
    res.render('pages/profile', { user, sessionData: sessionData(req) });
}

async function getEditUser(req, res) {
    const user = await model.getUserByHandle(req.params.handle);
    res.redirect('/');
}

async function postEditUser(req, res) {
    const handle = req.params.handle;
    res.redirect('/');
}

// todo: clean up ts ugly ass code
// also: do a permissions check in a function
async function postDeleteUser(req, res) {
    const session = sessionData(req);
    if (!session) {
        res.redirect('/');
        return;
    }
    const user = await model.getUserByHandleUnsafe(req.params.handle);
    if (session.token !== user.session) {
        res.redirect('/');
        return;
    }

    await model.deleteUser(user._id);
    res.redirect('/logout');
}

module.exports = { 
    getRoot,
    getRegister, postRegister,
    getLogin, postLogin, getLogout,
    getProfile,
    getEditUser, postEditUser, postDeleteUser
};