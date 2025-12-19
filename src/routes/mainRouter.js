const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const postController = require('../controllers/postController')

// handled by user controller
router.get('/', userController.getRoot)
router.get('/register', userController.getRegister)
router.get('/login', userController.getLogin)
router.get('/logout', userController.getLogout)

router.post('/api/validate-handle', userController.api.postValidateHandle)
router.post('/api/register', userController.api.postRegister)
router.post('/api/login', userController.api.postLogin)

router.get('/horse/:handle', userController.getProfile)

router.get('/horse/:handle/edit', userController.getEditUser)
router.post('/horse/:handle/edit', userController.postEditUser)

router.post('/horse/:handle/delete', userController.postDeleteUser)

// handled by post controller
router.get('/horse/:handle/post/:post', postController.getPostView)

router.get('/api/post/:post', postController.api.getPost)
router.post('/api/post/new', postController.api.postNewPost)
router.post('/api/post/:post/delete', postController.api.postDeletePost)

// error 500
router.use((err, req, res, next) => {
    console.error(err.stack)
    res.status(500).send('Something broke')
})

// error 404
router.use((req, res, next) => {
    res.status(404).send('Not found')
})

module.exports = router
