import express from "express";


import {protect,roleOnly} from '../Middlewares/authMiddleware.js'
import { addAvailability, deleteAvailability, getAvailability } from "../Controllers/availabilityController.js";

const availabilityRoute = express.Router()

availabilityRoute.post('/availability/add',protect,roleOnly("doctor"),addAvailability)
availabilityRoute.get('/availability/me',protect,roleOnly("doctor"),getAvailability)
availabilityRoute.delete('/availability/:date',protect,roleOnly("doctor"),deleteAvailability)

export default availabilityRoute;

/**
 *  add 
 * {
        "date": "2025-12-01",
        "slots": ["09:00", "09:30", "10:00"]
    }


    delete
    DELETE http://localhost:5000/doctor/availability/2025-12-01/
    
    {
        "slot": "09:30"
    }

 * 
 * 
 * 
 * 
 */

