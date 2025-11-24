import { generateToken } from '../auth/generateToken.js';
import { User } from '../Models/userModel.js'
import bcrypt from "bcryptjs";


export async function userRegister(req,res)
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


export async function doctorRegister(req,res)
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
        res.status(500).json({ message: err.message });
    }

}

export async function adminRegister(req,res)
{
    try 
    {
        const { name, email, password } = req.body;

        if (!name || !email || !password) 
        {
            return res.status(400).json({ message: "Missing required fields" });
        }

        const exists = await User.findOne({ email });
        if (exists) 
        {
            return res.status(400).json({ message: "Email already registered" });
        }

        const hashed = await bcrypt.hash(password, 10);

        const admin = await User.create({
            name,
            email,
            password: hashed,
            role: "admin"
        });

        res.status(201).json({
            message: "Admin created successfully",
            admin
        });

    }
    catch (err) 
    {
        res.status(500).json({ message: err.message });
    }
}


export async function login(req,res)
{
    try
    {
        const {email , password} = req.body
        if (!email || !password) 
        {
            return res.status(400).json({ message: "Missing email or password" });
        }
        const user = await User.findOne({email})
        if (!user)
        {
            return res.status(400).json({ message: "Invalid email or password" });
        }
        const match = await bcrypt.compare(password , user.password)
        if (!match)
        {
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = generateToken(user)
            res.status(200).json({
            message: "Login successful",
            token,
            user
        });
    }
    catch(err)
    {
        res.status(500).json({ message: err.message });
    }
}