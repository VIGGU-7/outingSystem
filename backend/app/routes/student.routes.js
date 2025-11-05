import Router from 'express'
import { loginStudent, logout, registerStudent, resendVerificationEmail, userOnBoard, verifyEmail } from '../controllers/student.controller.js'
import { studentMiddleware } from '../middleware/student.middleware.js'


const router=Router()

router.post("/signup",registerStudent)
router.post("/login",loginStudent)
router.post("/resend-verify",resendVerificationEmail)
router.get("/verify/:token",verifyEmail)
router.post("/onboard",studentMiddleware,userOnBoard)
router.get("/logout",studentMiddleware,logout)
export default router;