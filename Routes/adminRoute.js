import express from "express";
import {protect , roleOnly} from '../Middlewares/authMiddleware.js'
import { addDoctor, addUser, deleteDoctor, deleteUser, 
        getAllAppointments, getAllDoctors, getAllReports, 
        getAllUsers, getStats, promoteUser } 
        from "../Controllers/adminController.js";
export const adminRoute = express.Router()


// admin user
adminRoute.get('/admin/users',protect,roleOnly("admin"),getAllUsers)
adminRoute.delete('/admin/users/:id',protect,roleOnly("admin"),deleteUser)
adminRoute.post('/admin/users/promote/:id',protect,roleOnly("admin"),promoteUser)
adminRoute.post('/admin/users/add',protect,roleOnly("admin"),addUser)


// admin doctor
adminRoute.get('/admin/doctors',protect,roleOnly("admin"),getAllDoctors)
adminRoute.delete('/admin/doctors/:id',protect,roleOnly("admin"),deleteDoctor)
adminRoute.post('/admin/doctors/add',protect,roleOnly("admin"),addDoctor)

// admin appiontments 
adminRoute.get('/admin/appointments',protect,roleOnly("admin"),getAllAppointments)

// admin reports
adminRoute.get('/admin/reports',protect,roleOnly("admin"),getAllReports)

// admin staticts 
adminRoute.get('/admin/analytics',protect,roleOnly("admin"),getStats)