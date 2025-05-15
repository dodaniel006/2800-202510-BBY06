import { json, Router, urlencoded } from "express";
import { connectToMongo } from "../config/db.js";
import User from '../config/db_schemas/User.js';
import Gym from '../config/db_schemas/Gym.js';
import parser from "parse-address";
import { parse } from "dotenv";
const router = Router();
router.use(urlencoded({ extended: true }));

router.post("/submitGymInfo", async (req, res) => {
    let { gymName, place, userLocation } = req.body;
    let parsedPlace = parser.parseLocation(place);

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${place}, ${userLocation}`);
        const jsonData = await response.json();

        if (parsedPlace.number && !jsonData[0].house_number) {
            jsonData[0].display_name = `${parsedPlace.number} ${jsonData[0].display_name}`;
        }
        console.log("Place data:", userLocation);

        await connectToMongo();

        try {

            const data = await Gym.updateOne(
                { userId: req.session.userId },
                {
                    $set: {
                        userId: req.session.userId,
                        region: userLocation,
                        gymName: gymName,
                        gymAddress: place,
                        gymCoordinates: {
                            coordinates: [jsonData[0].lon, jsonData[0].lat],
                        },
                    },
                },
                { upsert: true }
            );
            if (data.matchedCount > 0 || data.upsertedCount > 0) {
                res.status(200).json({
                    success: true,
                    message: "User info submitted successfully",
                    data: jsonData,
                });
            } else {
                console.log("No changes made to the user info");
                res.status(404).json({ error: "User not found or no changes made" });

            }

        } catch (error) {
            console.error("Error in /submitUserInfo:", error);
            res.status(501).json({ error: "MongoDB query failed" });
        }

    } catch (error) {
        console.error("Error fetching place data:", error);
        res.status(500).json({ error: "Failed to fetch place data" });
    }

});

export default router;
