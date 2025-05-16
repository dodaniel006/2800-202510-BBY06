import { json, Router, urlencoded } from "express";
import { connectToMongo } from "../config/db.js";
import User from '../config/db_schemas/User.js';
import Gym from '../config/db_schemas/Gym.js';
import parser from "parse-address";
// import { parse } from "dotenv";
const router = Router();
router.use(urlencoded({ extended: true }));

function validateCoordinates(lon, lat) {
    return (
        typeof lon === "number" &&
        typeof lat === "number" &&
        lon >= -180 &&
        lon <= 180 &&
        lat >= -90 &&
        lat <= 90
    );
}

router.get("/reverseGeocode", async (req, res) => {
    let { lon, lat } = req.query;
    lon = Number(lon);
    lat = Number(lat);

    if (!validateCoordinates(lon, lat)) {
        console.log("Invalid coordinates provided.");
        res.status(400).json({ error: "Invalid coordinates provided" });
    } else {

        console.log("Valid coordinates provided:", lon, lat);
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`;

        try {
            const response = await fetch(url);
            const data = await response.json();

            if (data && data.address) {
                res.status(200).json({
                    success: true,
                    address: data.address,
                });
            } else {
                console.error("No address found for the given coordinates.");
                res.status(404).json({ error: "Address not found" });
            }
        } catch (error) {
            console.error("Error during reverse geocoding:", error);
            res.status(500).json({ error: "Failed to fetch geocode data" });
        }
    }

});

router.get("/checkDistance", async (req, res) => {
    let { lon, lat } = req.query;
    lon = Number(lon);
    lat = Number(lat);

    console.log("Coordinates received:", lon, lat);

    if (!validateCoordinates(lon, lat)) {
        console.log("Invalid coordinates provided.");
        res.status(400).json({ error: "Invalid coordinates provided" });
        return;
    } else {
        try {
            await connectToMongo();

            const gym = await Gym.findOne({
                userId: req.session.userId,
                gymCoordinates: {
                    $near: {
                        $geometry: {
                            type: "Point",
                            coordinates: [lon, lat],
                        },
                        $maxDistance: 500, // 500 meters
                    },
                },
            });

            console.log("Gym found:", gym);

            const distance = await Gym.aggregate([
                {
                    $geoNear: {
                        near: {
                            type: "Point",
                            coordinates: [lon, lat],
                        },
                        distanceField: "dist.calculated",
                        maxDistance: 500,
                        spherical: true,
                        query: { userID: req.session.userId },
                    },
                }
            ]);

            console.log("Distance data:", distance);

            if (gym) {
                console.log("Gym found within 500m radius");
                res.status(200).json({
                    success: true,
                    message: "Gym found within 500m radius",
                    distance: distance,
                });
            } else {
                console.log("No gym found within 500m radius");
                res.status(404).json({
                    success: false,
                    message: "No gym found within 500m radius",
                    distance: distance,
                });
            }
        } catch (error) {
            console.error("Error checking distance:", error);
            res.status(500).json({ error: "Failed to check distance" });
        }
    }
});

router.post("/submitGymInfo", async (req, res) => {
    let { gymName, place, userLocation } = req.body;

    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&addressdetails=1&q=${place}, ${userLocation}`);
        const jsonData = await response.json();

        if (jsonData.length != 0) {

            let parsedPlace = parser.parseLocation(place);
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
                                type: "Point",
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
                    res.status(200).json({ error: "User not found or no changes made" });
                }

            } catch (error) {
                console.error("Error in /submitUserInfo:", error);
                res.status(500).json({ error: "MongoDB query failed" });
            }
        } else {
            console.log("No data found for the given place");
            res.status(404).json({ error: "No data found for the given place" });
        }

    } catch (error) {
        console.error("Error fetching place data:", error);
        res.status(500).json({ error: "Failed to fetch place data" });
    }


});

export default router;
