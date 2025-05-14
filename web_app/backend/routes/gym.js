import { Router, urlencoded } from "express";
import { connectToMongo } from "../config/db.js";
import User from '../config/db_schemas/User.js';
import parser from "parse-address";
import { parse } from "dotenv";
const router = Router();
router.use(urlencoded({ extended: true }));

router.post("/submitUserInfo", async (req, res) => {
    let { userName, userAge, place, userLocation } = req.body;
    let parsedPlace = parser.parseLocation(place);
    // console.log("Place:", parsedPlace);

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${place}, ${userLocation}`);
        const data = await response.json();

        if (parsedPlace.number && !data[0].house_number) {
            data[0].display_name = `${parsedPlace.number} ${data[0].display_name}`;
        }
        console.log("Place data:", data);
        res.status(200).json(data);
    } catch (error) {
        console.error("Error fetching place data:", error);
        res.status(500).json({ error: "Failed to fetch place data" });
    }

    // await connectToMongo();

    // let result = await User.updateOne({ email: userName },
    //     { $set: { age: userAge } },
    //     {upsert: true} // Create a new document if no match is found
    // );

    // if (result.modifiedCount > 0) {
    //     res.status(200).json({
    //         success: true,
    //         message: "User age and height updated successfully",
    //     });
    // } else {
    //     res.status(404).json({ error: "User not found or no changes made" });
    // }

    // try {
    //     const { userName, userAge, userHeight } = req.body;

    //     await connectToMongo();
    //     const data = await User.insertOne({
    //         userName: userName,
    //         userAge: userAge,
    //         userHeight: userHeight,
    //     });

    //     if (data) {
    //         return res.status(200).json({
    //             success: true,
    //             message: "User info submitted successfully",
    //             userInfo: {
    //                 userName: userName,
    //                 userAge: userAge,
    //                 userHeight: userHeight,
    //             },
    //         });
    //     } else {
    //         return res.status(500).json({ error: "Failed to submit user info" });
    //     }
    // } catch (error) {
    //     console.error("Error in /submitUserInfo:", error);
    //     res.status(500).json({ error: "MongoDB query failed" });
    // }
});

export default router;
