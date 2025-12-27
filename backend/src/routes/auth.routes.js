import express from 'express'
import { signup, login, adminLogin, getAllPartners } from '../modules/auth/auth.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/signup', signup)
router.post('/login', login)
router.post('/admin/login', adminLogin)
router.get('/admin/partners', authMiddleware, getAllPartners)

export default router
