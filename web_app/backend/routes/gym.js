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

function haversine(lon1, lat1, lon2, lat2) {
    const toRadians = (degrees) => degrees * (Math.PI / 180);

    const R = 6371; // Radius of the Earth in kilometers
    const dLat = toRadians(lat2 - lat1);
    const dLon = toRadians(lon2 - lon1);

    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c; // Distance in kilometers
}

function checkDaily(lastUpdate) {
    let currentDate = new Date();
    let diff = currentDate.getTime() - lastUpdate.getTime();
    console.log("Time difference: " + diff);
    let diffHours = diff / 3.6000E6;
    console.log("Time difference in hours: " + diffHours);
    return diffHours;
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

    console.log("-------------------------------------------------------------");

    if (!validateCoordinates(lon, lat)) {
        console.log("Invalid coordinates provided.");
        res.status(400).json({ error: "Invalid coordinates provided" });
        return;
    } else {
        try {
            await connectToMongo();

            const gym = await Gym.findOne({
                userId: req.session.userId,
            });

            let daily = checkDaily(gym.updatedAt);
            if (daily >= 24) {

                // console.log("Granting points...");
                // await Gym.updateOne(
                //     { userId: req.session.userId },
                //     {
                //         $set: {
                //             updatedAt: new Date(),
                //         },
                //     }
                // );

            } else {

                let remaining = 24 - daily;
                let hours = Math.floor(remaining);
                console.log("Remaining minutes: " + (remaining - hours));
                let minutes = Math.ceil((remaining - hours) * 60);

                if (minutes == 60) {
                    hours += 1;
                    minutes = 0;
                }

                console.log(`Please wait ${hours} hours and ${minutes} minutes`);
            }

            let gymCoordinates = gym.gymCoordinates.coordinates;
            let distance = haversine(gymCoordinates[0], gymCoordinates[1], lon, lat);

            if (gym && distance <= 0.5) {
                console.log("Gym found within 500m radius");
                res.status(200).json({
                    success: true,
                    message: `${gym.gymName} found within 500m radius!`,
                    distance: distance,
                });
            } else {
                console.log("No gym found within 500m radius");
                res.status(200).json({
                    success: false,
                    message: `${gym.gymName} was not found within 500m radius`,
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
                            updatedAt: new Date("May 20, 2025 00:00:00"),
                            gymCoordinates: {
                                type: "Point",
                                coordinates: [Number(jsonData[0].lon), Number(jsonData[0].lat)],
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
