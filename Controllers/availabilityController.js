import { User } from "../Models/userModel.js";

export async function addAvailability(req,res)
{
    try
    {
        const doctorId = req.user.id
        const {date,slots} = req.body
        if (!date || !slots || !Array.isArray(slots))
        {
            return res.status(400).json({ message: "Date and slots are required" });
        }
        const doctor = await User.findById(doctorId)
        if (!doctor || doctor.role !== "doctor")
        {
            return res.status(403).json({ message: "Only doctors can add availability" });
        }
        const exists = doctor.availability.find((a)=> a.date === date)
        if (exists)
        {
            return res.status(400).json({ message: "Availability for this date already exists" });
        }
        doctor.availability.push({date,slots})
        await doctor.save()
        res.status(201).json({
            message: "Availability added successfully",
            availability: doctor.availability
        });

    }
    catch(err)
    {
        return res.status(500).json({ message: err.message })
    }
}



export async function getAvailability(req,res)
{
    try
    {
        const doctorId = req.user.id
        const doctor = await User.findById(doctorId)
        if (!doctor || doctor.role !== "doctor") 
        {
            return res.status(403).json({ message: "Only doctors can view this" });
        }
        res.status(200).json({
            availability: doctor.availability
        })
    }
    catch(err)
    {
        return res.status(500).json({ message: err.message })
    }
}



export async function deleteAvailability(req,res)
{
    try
    {
        const doctorId = req.user.id; 
        const { date } = req.params;
        const { slots} = req.body;

        const doctor = await User.findById(doctorId);

        if (!doctor) 
        {
            return res.status(404).json({ message: "Doctor not found" });
        }

        // find the date object in availability
        const day = doctor.availability.find(d => d.date === date);

        if (!day) 
        {
            return res.status(404).json({ message: "No availability found for this date" });
        }

        // remove the slot
        day.slots = day.slots.filter(s => s !== slots);

        // if slots becomes empty → remove whole date object
        if (day.slots.length === 0) 
        {
            doctor.availability = doctor.availability.filter(d => d.date !== date);
        }

        await doctor.save();

        res.json({ message: "Slot deleted successfully", availability: doctor.availability });
    }
    catch(err)
    {
        return  res.status(500).json({ message: err.message })
    }
}
