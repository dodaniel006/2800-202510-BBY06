import User from "./backend/config/db_schemas/User.js";
import connectToMongo from "./backend/config/db.js";
import { createUser } from "./backend/config/db.js";

async function main() {

    await connectToMongo();
    var user = await createUser({username: "bobbert", password: "bobpass", firstName: "bob", lastName: "bert", age: 25, email: "bobbyboi@bobbert.com"});
    console.log("User created successfully!");


    // fetch user and test password verification
    try {
        const foundUser = await User.findOne({ username: "bobbert"});
        if (foundUser) {
            console.log("User fetched successfully:", foundUser);
            // Check if comparePassword method exists
            if (typeof foundUser.comparePassword === 'function') {
                // Test password verification
                const isMatch = await foundUser.comparePassword("bobpass");
                console.log("Password match:", isMatch);
            } else {
                console.error("Error: comparePassword method not found on the user object.");
            }
        } else {
            console.log("User not found.");
        }
    } catch (err) {
        console.error("Error fetching user or comparing password:", err);
    }

}

export default main;