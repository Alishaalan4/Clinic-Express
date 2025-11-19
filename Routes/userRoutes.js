import mongoose from "mongoose";


const userSchema = new mongoose.Schema(
{
    name: 
    {
        type: String,
        required: true,
        trim: true,
    },

    email: 
    {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
    },

    password: 
    {
        type: String,
        required: true,
        minlength: 6,
    },

    phone: 
    {
        type: String,
        default: null,
    },

    role: 
    {
        type: String,
        enum: ["user", "doctor", "admin"],
        default: "user",
    },

    // =====================
    // User medical info
    // =====================
    bloodType: 
    {
        type: String,
        enum: ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-", null],
        default: null,
    },

    height: 
    {
        type: Number, // in cm
        default: null,
    },

    weight: 
    {
        type: Number, // in kg
        default: null,
    },

    // =====================
    // Doctor-specific fields
    // =====================
    specialization: 
    {
        type: String,
        default: null,
    },

    bio: 
    {
        type: String,
        default: null,
    },

    experienceYears: 
    {
        type: Number,
        default: null,
    },

    availability: 
    [
        {
            date: String,         // "2025-12-01"
            slots: [String],      // ["09:00", "10:30"]
        },
    ],



    // =====================
    // User uploaded medical reports
    // =====================
    medicalReports: 
    [
        {
            filename: String,
            fileUrl: String,
            uploadedAt: 
            {
                type: Date,
                default: Date.now,
            },
        },
    ],
},
    { timestamps: true }
)

export const User = mongoose.model('User',userSchema)








/*
🗂️ User Fields in Schema

name

email

password

phone

role: "user"

bloodType

height

weight

medicalReports: []

*/


/*
⭐ 2. DOCTOR
✅ Doctor Basic Info

name

email

password

phone



specialization

bio

experienceYears

availability:
[
  {
    date: "2025-12-01",
    slots: ["09:00", "09:30", "10:00"]
  }
]


*/
