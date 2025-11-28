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


