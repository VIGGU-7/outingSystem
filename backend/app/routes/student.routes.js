import Router from 'express'
import { loginStudent, registerStudent } from '../controllers/student.controller.js'


const router=Router()

router.post("/signup",registerStudent)
router.post("/login",loginStudent)

export default router;