import express from 'express'
import { signup, login, adminLogin, getAllPartners, getAllUsers, getAllTransactions } from '../modules/auth/auth.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

router.use(express.json())

router.post('/signup', signup)
router.post('/login', login)
router.post('/admin/login', adminLogin)
router.get('/admin/partners', authMiddleware, getAllPartners)
router.get('/admin/users', authMiddleware, getAllUsers)
router.get('/admin/transactions', authMiddleware, getAllTransactions)

export default router
