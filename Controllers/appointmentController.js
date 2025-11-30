import { User } from "../Models/userModel.js";
import {Appointment} from '../Models/appointmentModel.js'
import { sendEmail } from "../Utils/emailService.js";


// helper function to check if slot exists in doctor availability
function slotExistsInAvailability(doctor,date,time)
{
    const day = doctor.availability.find(d=>d.date === date)
    if (!day){return false}
    return day.slots.includes(time)
}


// remove a slot from doctor availability and save 
export async function removeSlotFromDoctor(doctor,date,time)
{
    const day = doctor.availability.find(d=> d.date === date)
    if (!day) return false 
    day.slots = day.slots.filter (s => s!==time)
    // if no slots left, remove the date
    if (day.slots.length === 0)
    {
        doctor.availability = doctor.availability.filter(d=> d.date !==date)
    }
    await doctor.save()
}

// add the slot back if not present 
export async function addSlotBackToDoctor(doctor,date,time)
{
    let day = doctor.availability.find(d=>d.date === date)
    if (day)
    {
        if (!day.slots.includes(time))
        {
            day.slots.push(time)
            day.slots.sort()
        }
    }
    else
    {
        doctor.availability.push({date,slots:{time}})
    }
}


// user booking appointment 
export async function bookAppointment(req,res)
{
    try
    {
        const userId = req.user.id
        if (req.user.role != "user")
        {
            return res.status(403).json({ message: "Only users can book appointments."})
        }
        const {doctorId , date , time , reason } = req.body
        if (!doctorId  || !date || !time)
        {
            return res.status(400).json({ message:"doctorId, date and time are required."})
        }
        // doctor
        const doctor = await User.findById(doctorId)
        if (!doctor || doctor.role!=="doctor")
        {
            return res.status(400).json({ message: "Doctor not found."})
        }
        // first check doctor availability of slot
        if (!slotExistsInAvailability(doctor,date,time))
        {
            return res.status(400).json({ message: "Selected slot is not available." })
        }
        // double check that doctor is not booked at the time 
        const doctorConflict = await Appointment.findOne({
            doctorId,
            date,
            time,
            status:{$ne:"cancelled"}
        })
        if (doctorConflict)
        {
            return res.status(400).json({message:"Doctor already booked for this slot."})
        }
        // check is user is not already booked at the same time 
        const userConflict= await Appointment.findOne({
            userId,
            date,
            time,
            status:{$ne:"cancelled"}
        })
        if (userConflict)
        {
            return res.status(400).json({message: "You already have an appointment at this date/time." })
        }
        // after all confirmation, book the appointment
        const appointment = await Appointment.create({
            userId,
            doctorId,
            date,
            time,
            reason:reason||null,
            status:"pending",
            createdBy:"user"
        })

        // remove slot after booking 
        await removeSlotFromDoctor(doctor,date,time)

        // send an email 
        try
        {
        await sendEmail({
            to: req.user.email,
            subject: `Appointment requested with Dr. ${doctor.name} - ${date} ${time}`,
            text: `Your appointment request for ${date} at ${time} with Dr. ${doctor.name} has been received and is pending confirmation.`,
            html: `<p>Your appointment request for <b>${date} ${time}</b> with <b>Dr. ${doctor.name}</b> has been received and is <b>pending confirmation</b>.</p>`
        });
    } catch (e) {
        // don't fail booking if email fails; log optionally
        console.error("Email send failed:", e.message);
    }
    
    return res.status(201).json({ message: "Appointment requested successfully.", appointment });

    }
    catch(err)
    {
        return res.status(500).json({ message: err.message });
    }
}






// user get appointments
export async function getUserAppointments(req,res)
{
    try
    {
        const userId = req.user.id
        if (req.user.role !== "user")
        {
            return res.status(403).json({ message: "Only users can access this endpoint."})
        }
        const appointments = await Appointment.find({userId}).populate("doctorId", "name email specialization")
        return res.json({appointments})
    }
    catch(err)
    {
        return res.status(500).json({ message: err.message });
    }
}


// doctor appointments 
export async function getDoctorAppointments(req,res)
{
    try
    {
        const doctorId = req.user.id
        if (req.user.role !== "doctor")
        {
            return res.status(403).json({ message: "Only doctors can access this endpoint." });
        }

        const appointments =   await Appointment.find()
        .populate("userId", "name email phone")
        return res.json({appointments})
    }
    catch(err)
    {
        return res.status(500).json({message:err.message})
    }
    
}



// admin all appointmetns 
export async function getAllAppointments(req,res)
{
    try
    {
        if (req.user.role !== "admin")
        {
            return res.status(403).json({ message: "Only admin can access." });
        }
        const appointments = await Appointment.find().populate("userId" ,"name email").populate("doctorId" ,"name email")
        return res.json({appointments})
    }
    catch(err)
    { 
        return res.status(500).json({ message: err.message })
    }

}



// admin create appointment 
export async function adminCreateAppointment(req,res) 
{
    try
    {
        if (req.user.role !== "admin")
        {
            return res.status(403).json({message : "Only admin can create appointments Here."})
        }
        const {userId , doctorId , date , time , reason } = req.body
        if (!userId || !doctorId || !date || !time)
        {
            return res.status(400).json({ message: "userId, doctorId, date and time are required."})
        }

        const doctor = await User.findById(doctorId)
        const user = await User.findById(userId)

        // check if slot exists
        if (!slotExistsInAvailability(doctor,date,time))
        {
            return res.status(400).json({message: "Selected slot is not available."})
        }

        // check conflicts 
        const doctorConflict = await Appointment.findOne({doctorId,date,time})
        if (doctorConflict) 
        {
            return res.status(400).json({ message: "Doctor already booked for this slot."})
        }

        const userConflict = await Appointment.findOne({userId,date,time})
        if (userConflict)
        {
            return res.status(400).json({ message: "User already booked  this slot."})
        }

        const appointment = await Appointment.create({
            userId,
            doctorId,
            date,
            time,
            reason : reason  || null,
            status : "confirmed",
            createdBy : "admin"
        })
        await removeSlotFromDoctor(doctor,date,time)
        try
        {
            await sendEmail({
                to:user.email,
                subject: `Appointment scheduled with Dr. ${doctor.name} - ${date} ${time}`,
                text: `Your appointment for ${date} ${time} with Dr. ${doctor.name} has been scheduled by admin.`,
                html: `<p>Your appointment for <b>${date} ${time}</b> with <b>Dr. ${doctor.name}</b> has been scheduled by admin.</p>`
            })
        }
        catch(err)
        {
            console.error("Email send failed:", err.message);
        }

        return res.status(201).json({ message: "Appointment created by admin.", appointment });
    }
    catch(err)
    {
        return res.status(500).json({ message: err.message })
    }

}



// doctor create appointment 
export async function doctorAddAppointment(req,res)
{
    try
    {
        const doctorId =  req.user.id
        if (req.user.role !== "doctor")
        {
            return res.status(403).json({ message: "Only doctors can create manual appointments here." });
        }
        const {userId , date , time , reason} = req.body
        if (!userId || !date || !time )
        {
            return res.status(400).json({ message: "userId, date and time are required" });
        }

        const doctor = await User.findById(doctorId)
        const user = await User.findById(userId)
        if (!user)
        {
            return res.status(404).json({ message: "User not found." });
        }

        if (!slotExistsInAvailability(doctor,date,time))
        {
            return res.status(400).json({ message: "Selected slot is not available." });
        }

        const doctorConflict = await Appointment.findOne({ doctorId, date, time, status: { $ne: "cancelled" } });
        if (doctorConflict)
        {
            return res.status(400).json({ message: "Doctor already booked for this slot." });
        } 
            
        const userConflict = await Appointment.findOne({ userId, date, time, status: { $ne: "cancelled" } });
        if (userConflict)
        {
            return res.status(400).json({ message: "User already has an appointment at this date/time." });  
        } 

        const appointment = await Appointment.create({
            userId,
            doctorId,
            date,
            time,
            reason: reason || null,
            status: "confirmed",
            createdBy: "doctor"
        });

        await removeSlotFromDoctor(doctor, date, time);

    // notify user
        try 
        {
            await sendEmail({
                to: user.email,
                subject: `Appointment scheduled with Dr. ${doctor.name} - ${date} ${time}`,
                text: `Your appointment for ${date} ${time} with Dr. ${doctor.name} has been scheduled by the doctor.`,
                html: `<p>Your appointment for <b>${date} ${time}</b> with <b>Dr. ${doctor.name}</b> has been scheduled by the doctor.</p>`
            });
        }
        catch (e) 
        {
            console.error("Email send failed:", e.message);
        }

    return res.status(201).json({ message: "Appointment created by doctor.", appointment });
    }
    catch(err)
    {
        return res.status(500).json({ message: err.message })
    }
}



// cancel appointment 
export async function cancelAppointment(req,res)
{
    try
    {
        const appointmentId = req.params.id
        // user here can be admin,doctor,client 
        const user = req.user 
        const appointment = await Appointment.findById(appointmentId)
        if (!appointment)
        {
            return res.status(404).json({ message: "Appointment not found." });
        }
        // only the user who booked or the assigned doctor or admin can cancel
        if (user.role !=="admin" &&    
            user._id.toString() !== appointment.userId.toString() &&
            user._id.toString() !== appointment.doctorId.toString() )
        {
            return res.status(403).json({ message: "Not authorized to cancel this appointment." });
        }
        appointment.status = "cancelled";
        await appointment.save();

        try
        {
            const user = await User.findById(appointment.userId);
            if (user) {
                await sendEmail({
                to: user.email,
                subject: `Appointment cancelled - ${appointment.date} ${appointment.time}`,
                text: `Your appointment on ${appointment.date} at ${appointment.time} has been cancelled.`,
                html: `<p>Your appointment on <b>${appointment.date} ${appointment.time}</b> has been cancelled.</p>`
                });
                }
        } 
        catch (e) 
        {
            console.error("Email send failed:", e.message);
        }
        return res.json({ message: "Appointment cancelled successfully." });
    }
    catch(err)
    {
        return res.status(500).json({ message: err.message });
    }
}

// doctor confirm 
export async function confirmAppointment(req,res)
{
    try
    {
        const appointmentId = req.params.id
        const doctorId = req.user.id
        if(req.user.role !== "doctor")
        {
            return res.status(403).json({message: "Only doctors can confirm appointments."})
        }
        const appointment = await Appointment.findById(appointmentId)
        if (!appointment)
        {
            return res.status(404).json({ message: "Appointment not found." });

        }
        // only specified doctor to confirm the appointment 
        if (appointment.doctorId.toString() !== doctorId)
        {
            return res.status(403).json({ message: "You are not assigned to this appointment." });
        }
        appointment.status = "confirmed"
        await appointment.save()

        // email confirmation
        try 
        {
            const user = await User.findById(appointment.userId);
            const doctor = await User.findById(doctorId);
            if (user && doctor) {
                await sendEmail({
                    to: user.email,
                    subject: `Appointment confirmed by Dr. ${doctor.name} - ${appointment.date} ${appointment.time}`,
                    text: `Your appointment for ${appointment.date} ${appointment.time} has been confirmed by Dr. ${doctor.name}.`,
                    html: `<p>Your appointment for <b>${appointment.date} ${appointment.time}</b> has been confirmed by Dr. <b>${doctor.name}</b>.</p>`
                });
                }
        } 
        catch (e) 
        {
            console.error("Email send failed:", e.message);
        }

        return res.json({ message: "Appointment confirmed." });
    }
    catch(err)
    {
        return res.status(500).json({ message: err.message })
    }
}
