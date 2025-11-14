import Router from 'express'
import { guardMiddleware } from '../middleware/guard.middleware.js'
import { approveOuting, checkAuthenticated, completeOuting,  getOutingById,  getOutingByMis,  getOutingDetailsSortByDate, guardLogin, guardRegister, logout, rejectOuting, statistics } from '../controllers/guard.controller.js'
const router=Router()
router.post("/signup",guardRegister)
router.post("/login",guardLogin)
router.post("/approve",guardMiddleware,approveOuting)
router.post("/reject",guardMiddleware,rejectOuting)
router.post("/complete",guardMiddleware,completeOuting)
router.get("/getOutings",guardMiddleware,getOutingDetailsSortByDate)
router.get("/check",guardMiddleware,checkAuthenticated)
router.get("/getoutings/:Mis",guardMiddleware,getOutingByMis)
router.get("/getoutings/id/:id",guardMiddleware,getOutingById)
router.get("/logout",guardMiddleware,logout)
router.get("/stats",guardMiddleware,statistics)
export default router;