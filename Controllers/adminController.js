import { User } from "../Models/userModel.js";
import {Appointment} from '../Models/appointmentModel.js'
import { Report } from "../Models/reportModel.js";
import bcrypt from "bcryptjs";

// users
export async function getAllUsers(req,res) 
{
    try
    {
        const users = await User.find().select("-password")
        res.status(200).json(users)
    }   
    catch(err)
    {
        console.log('Server Error')
        return res.status(500).json({ message: err.message });
    }
}


// add user
export async function addUser(req,res)
{
        try
        {
            const { name, email, password, phone, bloodType, height, weight } = req.body;
            if (!name || !email || !password || !phone || !bloodType || !height || !weight)
            {
                return res.status(400).json({ message: "Missing required fields" });
            }
            const exists = await User.findOne({email})
            if (exists)
            {
                return res.status(400).json({ message: "Email already registered" });
            }
            const hashed = await bcrypt.hash(password,10)
            const user = await User.create({
                name,
                email,
                phone,
                password: hashed,
                role: "user",
                bloodType,
                height,
                weight
            })
                res.status(201).json(
                {
                    message: "User registered successfully",
                    user
                });
        }
        catch(err)
        {
            res.status(500).json({ message: err.message });
        }
}

// delete users
export async function deleteUser(req,res)
{
    try
    {
        const user = req.params.id
        if (!user)
        {
            res.status(404).json({msg:"User not Found"})
        }
        await User.findByIdAndDelete(user)
        res.status(200).json({msg:"User Deleted"})
    }   
    catch(err)
    {
        console.log('Server Error')
        return res.status(500).json({ message: err.message });
    } 
}


// prompte 
export async function promoteUser(req,res)
{
    try
    {   
        const user = await User.findById(req.params.id)
        if (!user)
        {
            return res.status(404).json({msg:"User not Found"})
        }
        user.role="doctor"
        await user.save()
        res.json({msg:"User promoted to Doctor",user})
    }
    catch(err)
    {
        console.log('Server Error')
        return res.status(500).json({ message: err.message });
    }
}


// doctors 
export async function getAllDoctors(req,res)
{
    try
    {
        const doctor = await User.find({role:"doctor"}).select("-password")
        res.json(doctor)
    }
    catch(err)
    {
        console.log('Server Error')
        return res.status(500).json({ message: err.message });
    }
}


// add doctor 
export async function addDoctor(req,res)
{
    try
    {
        const { name, email, password, phone, specialization, bio, experienceYears, bloodType ,height, weight } = req.body;
        if (!name || !email || !password || !phone || !specialization || !bio || !experienceYears  || !bloodType || !height || !weight)
        {
            return res.status(400).json({ message: "Missing required fields" })
        }
        const exists = await User.findOne({email})
        if (exists)
        {
            return res.status(400).json({ message: "Email already registered" }); 
        }
        const hashed = await bcrypt.hash(password,10)
        const doctor = await User.create({
            name,
            email,
            phone,
            password: hashed,
            role: "doctor",
            bloodType,
            height,
            weight,
            specialization,
            bio,
            experienceYears,
        })
        res.status(201).json({
            message: "Doctor registered successfully",
            doctor
        });
    }
    catch(err)
    {
        console.log('Server Error')
        return res.status(500).json({ message: err.message });     
    }
}


export async function deleteDoctor(req,res)
{
    const doctor = await User.findByIdAndDelete(req.params.id)
    res.status(200).json({msg:"Doctor Deleted"})

}

// appointments 
export async function getAllAppointments(req,res)
{
    try
    {
        const appiontment = await Appointment.find().populate("userId,name email").populate("doctorId,name email")
        res.json(appiontment)
    }
    catch(err)
    {
        console.log('Server Error')
        return res.status(500).json({ message: err.message });
    }
}



// reports 
export async function getAllReports(req,res)
{
    try
    {
        const report = await Report.find().populate("user").populate("doctor")
        res.json(report)
    }
    catch(err)
    {
        console.log('Server Error')
        return res.status(500).json({ message: err.message });
    }
}





export async function getStats(req,res)
{
    try
    {
        const totalUsers = await User.countDocuments()
        const totalDoctors = await User.countDocuments({role:"doctor"})
        const totalAppointments = await Appointment.countDocuments()
        const totalReports = await Report.countDocuments()
        const dailyAppointments = await Appointment.aggregate([
        {
            $addFields: {
                convertedDate: { $toDate: "$date" }
            }
        },
        {
            $group: {
                _id: { 
                    $dateToString: { 
                        format: "%Y-%m-%d", 
                        date: "$convertedDate" 
                    }
                },
                count: { $sum: 1 }
            }
        },
            { $sort: { _id: 1 } }
        ]);
        res.json({
        totalUsers,
        totalDoctors,
        totalAppointments,
        totalReports,
        dailyAppointments     
        })
    }
    catch(err)
    {
        console.log('Server Error')
        return res.status(500).json({ message: err.message });
    }
}