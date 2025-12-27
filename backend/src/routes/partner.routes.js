import express from 'express'
import { addPartner, partnerLogin } from '../modules/partners/partner.controller.js'
import authMiddleware from '../middlewares/auth.middleware.js'

const router = express.Router()

router.post('/add', authMiddleware, addPartner)
router.post('/login', partnerLogin)

export default router