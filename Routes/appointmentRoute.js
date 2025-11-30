import express from "express";
import {
    bookAppointment,
    getUserAppointments,
    getDoctorAppointments,
    getAllAppointments,
    adminCreateAppointment,
    doctorAddAppointment,
    cancelAppointment,
    confirmAppointment
} from "../Controllers/appointmentController.js";
import { sendEmail } from "../Utils/emailService.js";

import { protect, roleOnly } from "../Middlewares/authMiddleware.js";

export const appointmentRoute = express.Router();

// user books
appointmentRoute.post("/user/book", protect, roleOnly("user"), bookAppointment);

// user appointments for user
appointmentRoute.get("/user/appointments", protect, roleOnly("user"), getUserAppointments);

// doctor appointments
appointmentRoute.get("/doctor/appointments", protect, roleOnly("doctor"), getDoctorAppointments);

// Admin - view all
appointmentRoute.get("/admin/appointments", protect, roleOnly("admin"), getAllAppointments);

// Admin create appointment (admin sets confirmed directly)
appointmentRoute.post("/admin/create", protect, roleOnly("admin"), adminCreateAppointment);

// Doctor create appointment (creates confirmed)
appointmentRoute.post("/doctor/create", protect, roleOnly("doctor"), doctorAddAppointment);

// Cancel appointment (user/doctor/admin allowed as logic implemented)
appointmentRoute.delete("/:id/cancel", protect, cancelAppointment);

// Doctor confirm appointment (pending -> confirmed)
appointmentRoute.put("/doctor/:id/confirm", protect, roleOnly("doctor"), confirmAppointment);



appointmentRoute.get("/test-email", async (req, res) => {
    try 
    {
        await sendEmail({
        to: "shaalanali20@gmail.com",
        subject: "Test Email Working",
        text: "This is a test email",
        });
        res.json({ message: "Email sent!" });
    } 
    catch (e) 
    {
        console.log("EMAIL ERROR:", e);
        res.status(500).json({ error: e.message });
    }
});











/*

    // user book
    POST
        Headers:
            Authorization: Bearer <user_token>
        Body JSON:
        {
            "doctorId": "64abc...def",
            "date": "2025-12-01",
            "time": "09:00",
            "reason": "Chest pain"
        }

    


    // doctor confirm appointment 
    PUT http://localhost:8000/api/doctor/<appointmentId>/confirm
    Headers:
        Authorization: Bearer <doctor_token>
    No body required

    
    
    // admin create appointment   
    POST http://localhost:8000/api/admin/create
    Headers:
        Authorization: Bearer <admin_token>
    Body JSON:
    {
        "userId": "64abc...usr",
        "doctorId": "64abc...doc",
        "date": "2025-12-01",
        "time": "10:00",
        "reason": "Follow-up"
    }




    // cancel appointment, admin or doctor
    DELETE http://localhost:5000/api/appointments/<appointmentId>/cancel
    Headers:
        Authorization: Bearer <token>





*/