import express from "express";
import { adminRegister, doctorRegister, login, userRegister } from "../Controllers/authController.js";

export const authRoute = express.Router()


authRoute.post('/user/register',userRegister)
authRoute.post('/doctor/register',doctorRegister)
authRoute.post('/admin/register',adminRegister)

authRoute.post('/login',login)
