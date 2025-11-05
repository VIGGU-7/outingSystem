import Router from 'express'
import { loginStudent, registerStudent, resendVerificationEmail } from '../controllers/student.controller.js'


const router=Router()

router.post("/signup",registerStudent)
router.post("/login",loginStudent)
router.post("/resend-verify",resendVerificationEmail)
export default router;