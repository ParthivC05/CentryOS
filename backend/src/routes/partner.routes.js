import express from 'express'
import { addPartner, partnerLogin, getUsersByPartnerCode } from '../modules/partners/partner.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/add', authMiddleware, addPartner)
router.post('/login', partnerLogin)
router.get('/users', authMiddleware, getUsersByPartnerCode)

export default router