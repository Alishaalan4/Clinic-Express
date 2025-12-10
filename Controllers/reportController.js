import { Report } from "../Models/reportModel.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY_DOCTOR);

// user upload report 
export async function uploadReport(req,res)
{
    try
    {
        const {file , fileType , description } = req.body
        if (!file || !fileType)
        {
            return res.status(400),json({message: "fileData (base64) and fileType required."})
        }
        const report = await Report.create({
            user : req.user.id,
            file,
            fileType,
            description:description || ""
        })

        res.status(201).json({
            message: "Report uploaded successfully",
            report
        })
    }
    catch(err)
    {    
        res.status(500).json({ message: err.message });
    }
}




// user all reports
export async function getMyReports(req,res) 
{
    try
    {
        const reports = await Report.find({user:req.user.id}).sort({createdAt:-1})
        res.status(200).json({reports})
    }
    catch(err)
    {
        res.status(500).json({ message: err.message });
    }

}



// user delete report 
export async function deleteReport(req,res)
{
    try
    {
        const report = await  Report.findOneAndDelete({
            _id:req.params.id,
            user:req.user.id
        })
        if (!report)
        {
            res.status(404).json({ message: "Report not found."})
        }
        res.status(200).json({message: "Report deleted." })
    }
    catch(err)
    {
        res.status(500).json({ message: err.message });
    }
}

// doctor view user report
export async function doctorViewUserReports(req,res)
{
    try
    {
        const report = await Report.find({user:req.params.id}).populate("user","name email").sort({created:-1})
        res.status(200).json({report})
    }
    catch(err)
    {
        res.status(500).json({ message: err.message });
    }
}



// doctor ai analysis
export async function analyzeReport(req,res)
{


    try
    {
        const report = await Report.findById(req.params.reportId)
        if (!report)
        {
            return res.status(404).json({ message: "Report not found." });
        }
        const absolutePath = path.join(process.cwd(), report.filePath);
        const fileBuffer = fs.readFileSync(absolutePath);
        const base64 = fileBuffer.toString("base64");


        const mimeMap = {
            image: "image/jpeg",   // or detect dynamically
            pdf: "application/pdf",
            other: "application/octet-stream"
            };

        const mimeType = mimeMap[report.fileType] || "application/octet-stream";

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const result = await model.generateContent([
        {
            inlineData: {
            data: base64,
            mimeType: mimeType
            }
        },
        {
        text: `
            Analyze this medical report.
            Provide:
            - Summary
            - Risks
            - Possible diagnoses
            - Recommended tests
            - Recommendations
        `
        }
    ]);

    const aiOutput = result.response.text();

    report.aiAnalysis = aiOutput;
    report.doctor = req.user.id;
    await report.save();

    res.status(200).json({
        message: "AI analysis completed.",
        aiAnalysis: aiOutput
    });

    }
    catch(err)
    {
        return res.status(500).json({ message: err.message })
    }
}



// mutler function
export async function addReport(req,res)
{
    try
    {
        if(!req.file)
        {
            return res.status(400).json({ message: "No file uploaded" });
        }
        const { fileType, description } = req.body;
        const report = await Report.create(
            {
                user: req.user.id,
                filePath: req.file.path, // to db
                fileType,
                description,
            });

        res.status(201).json({
            message: "File uploaded and saved",
            report,   
    });
    }
    catch(err)
    {
        res.status(500).json({ message: err.message });
    }
}