import mongoose from "mongoose";

const appointmentSchema = new mongoose.Schema(
{
    userId: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    doctorId: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    date: 
    {
        type: String, // "2025-12-01"
        required: true,
    },

    time: 
    {
        type: String, // "10:30"
        required: true,
    },

    status: 
    {
        type: String,
        enum: ["pending", "confirmed", "cancelled"],
        default: "pending",
    },

    reason: 
    {
        type: String, // why the user booked the appointment
        default: null,
    },

    notes: 
    {
        type: String, // doctor notes after confirmation
        default: null,
    },

    // admin or doctor can add appointment manually
    createdBy: 
    {
        type: String,
        enum: ["user", "doctor", "admin"],
        default: "user",
    },
},
    { timestamps: true }
)


export const Appointment = mongoose.model("Appointment",appointmentSchema)


/*

userId

The patient who booked the appointment.

doctorId

The doctor assigned to the appointment (comes from the User model).

date & time

We store them separately to make conflict detection easier.

Example:

date: "2025-12-10"

time: "14:30"

status

pending: user booked, waiting for doctor approval

confirmed: doctor approves

cancelled: user or doctor cancels

reason

User writes why they need the appointment.

notes

Doctor writes notes (optional).

createdBy

Tracks who made the appointment:

user

doctor

admin

*/