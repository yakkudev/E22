async function err(err, req, res, next) {
    console.error(err.stack)
    res.status(500).render('pages/error', {
        code: 500,
        message: 'oopsie.',
        sessionData: req.sessionData,
    })
}

async function notFound(req, res, next) {
    res.status(404).render('pages/error', {
        code: 404,
        message: 'not found.',
        sessionData: req.sessionData,
    })
}

module.exports = { err, notFound }
