import mongoose from 'mongoose';
import bcrypt from 'bcrypt';

const userSchema = new mongoose.Schema({

    firstName: String,
    lastName: String,
    age: {
        type: Number,
        min: 0,
        max: 120
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        validate: {
            validator: function (v) {
                return validateEmail(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    password: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        immutable: true,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    },

});

// Middleware to automatically hash password before saving
userSchema.pre('save', async function (next) {
    var user = this;

    // Only hash the password if it has been modified (or is new)
    if (!user.isModified('password')) return next();

    try {
    // Generate a salt
    const salt = await bcrypt.genSalt(10);
    // Hash and override the password using the salt
    user.password = await bcrypt.hash(user.password, salt);
    next();
    } catch (err) {
        next(err);
    }

})

/**
 * userSchema.methods is a special object provided by mongoose that allows you to
 * define custom instance methods for the schema. These methods can be called on instances of the model.
 * In this case, we are defining a method called comparePassword that will be used to
 * compare a candidate password with the hashed password stored in the database.
 */

userSchema.methods.comparePassword = async function (candidatePassword) {
    try {
        // Compare the candidate password with the hashed password
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (err) {
        throw new Error(err);
    }
}

// Validate email format using regex
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()\[\]\\.,;:\s@"]+\.)+[^<>()\[\]\\.,;:\s@"]{2,})$/i;
    return re.test(email);
}

// Export the User model
const User = mongoose.model('User', userSchema);
export default User;