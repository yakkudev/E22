const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const postController = require('../controllers/postController')
const errorController = require('../controllers/errorController')

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
router.get('/post/:post', postController.getPostShort)
router.get('/horse/:handle/post/:post', postController.getPostView)

router.get('/api/post/:post', postController.api.getPost)
router.post('/api/post/:post/reply', postController.api.postReplyPost)
router.post('/api/post/new', postController.api.postNewPost)
router.post('/api/post/:post/delete', postController.api.postDeletePost)

// errors
router.use(errorController.err)
router.use(errorController.notFound)

module.exports = router
