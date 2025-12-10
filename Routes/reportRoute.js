import express from "express";
import { protect,roleOnly } from "../Middlewares/authMiddleware.js";
import { addReport, analyzeReport, deleteReport, doctorViewUserReports, getMyReports, uploadReport } from "../Controllers/reportController.js";
import { upload } from "../Middlewares/upload.js";
export const reportRoute = express.Router()


// user part
// reportRoute.post("/user/reports/upload",protect,roleOnly("user"),uploadReport)
reportRoute.get("/user/reports",protect,roleOnly("user"),getMyReports)
reportRoute.delete("/user/reports/:id",protect,roleOnly("user"),deleteReport)


// doctor part 
reportRoute.get("/doctor/user/:id/reports",protect,roleOnly("doctor"),doctorViewUserReports)
reportRoute.post("/doctor/reports/analyze/:reportId",protect,roleOnly("doctor"),analyzeReport)



// single file input name = "file"
reportRoute.post("/upload",protect,roleOnly("user"), upload.single("file"), addReport);