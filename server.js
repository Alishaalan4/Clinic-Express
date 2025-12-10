import express from "express";
import dotenv from 'dotenv'
import cors from 'cors'
import mongoose from "mongoose";
import { authRoute } from "./Routes/authRoutes.js";
import availabilityRoute from "./Routes/availabilityRoutes.js";
import  {appointmentRoute}  from "./Routes/appointmentRoute.js";
import { reportRoute } from "./Routes/reportRoute.js";
dotenv.config()

const app = express()
app.use(express.json())
app.use(cors())

const PORT = process.env.PORT
const MONGO_URI = process.env.MONGO_URI

app.use('/api',authRoute)
app.use('/api',availabilityRoute)
app.use('/api',appointmentRoute)
app.use('/api',reportRoute)

app.listen(PORT,() => console.log(`Server is running on http://localhost:${PORT}`)).on('error',(err)=>{'Server Error : ',err})
mongoose.connect(MONGO_URI).then(()=>
{
    console.log('MongoDb is Connected')
}).catch((err)=>
{
    console.log(`Failed to Connect: `,err)
})