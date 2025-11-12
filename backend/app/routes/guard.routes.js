import Router from 'express'
import { guardMiddleware } from '../middleware/guard.middleware.js'
import { approveOuting, completeOuting, getOutingDetailsByMis, getOutingDetailsSortByDate, guardLogin, guardRegister, rejectOuting } from '../controllers/guard.controller.js'
const router=Router()
router.post("/signup",guardRegister)
router.post("/login",guardLogin)
router.post("/approve",guardMiddleware,approveOuting)
router.post("/reject",guardMiddleware,rejectOuting)
router.post("/complete",guardMiddleware,completeOuting)
router.get("/getOutings",guardMiddleware,getOutingDetailsSortByDate)
router.get("/getoutings/:MIS",guardMiddleware,getOutingDetailsByMis)
export default router;