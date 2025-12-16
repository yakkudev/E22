const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')

router.get('/', userController.getRoot)
router.get('/register', userController.getRegister)
router.post('/register', userController.postRegister)
router.get('/login', userController.getLogin)
router.post('/login', userController.postLogin)
router.get('/logout', userController.getLogout)

router.get('/horse/:handle', userController.getProfile)

router.get('/horse/:handle/edit', userController.getEditUser)
router.post('/horse/:handle/edit', userController.postEditUser)

router.post('/horse/:handle/delete', userController.postDeleteUser)

module.exports = router
