import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
{
        user: 
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

    doctor: 
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default: null, // doctor who reviewed the report
    },

    filePath: 
    { 
        type: String,          // BASE64 DATA
        required: true,
    },

    fileType:   
    {
        type: String,
        enum: ["image", "pdf", "other"],
        required: true,
    },

    description: 
    {
        type: String,
        default: "",
    },

    aiAnalysis:     
    {
        type: String,
        default: null, // saved AI feedback
    },
},
    { timestamps: true }
)
export const Report = mongoose.model("Report",reportSchema)

/*
Report Model

Purpose: Store medical files uploaded by users

Fields:

user (who uploaded)

doctor (optional, who reviewed)

fileUrl (storage path)

fileType (image/pdf/other)

description (optional note)

aiAnalysis (optional text, filled after AI analysis)

✅ Now complete

Why separate reportModel?

Easier to query all reports

AI can attach analysis to the report

Users and doctors can access reports independently
*/