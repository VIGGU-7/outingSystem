import Router from 'express'
import { addOuting,getStudentHistory } from '../controllers/outing.controller.js'
import { studentMiddleware } from '../middleware/student.middleware.js'
const router=Router()
router.post("/add",studentMiddleware,addOuting)
router.get("/",studentMiddleware,getStudentHistory)
export default router;