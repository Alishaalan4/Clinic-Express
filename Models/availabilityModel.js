import mongoose from "mongoose";

const availabilitySchema = new mongoose.Schema(
{
    doctor: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    },

    date: 
    {
        type: Date,
        required: true,
    },

    startTime: 
    {
        type: String, // "09:00"
        required: true,
    },

    endTime: 
    {
        type: String, // "12:00"
        required: true,
    },

    // optional: to block specific ranges later
    isBlocked: 
    {
        type: Boolean,
        default: false,
    },
},
    { timestamps: true }
)

export const Availability = mongoose.model("Availability",availabilitySchema)


/*

Purpose: Tracks doctor’s available time slots separately (useful for complex scheduling and conflict detection)

Fields:

doctor (ref to User)

date (specific day)

startTime / endTime (slot range, e.g., 09:00–12:00)

isBlocked (optional, e.g., holidays)

✅ Now complete

Why separate availabilityModel?

Even though we have availability inside the User schema, a dedicated model allows:

easier queries (find all doctors free on a date)

future enhancements (recurring slots, exceptions)

conflict detection without reading embedded arrays


*/