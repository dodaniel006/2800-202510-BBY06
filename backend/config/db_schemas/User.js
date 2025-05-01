import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({

    firstName: {
        type: String,
        required: true
    },
    lastName: String,
    age: Number,
    email: {
        type: String,
        required: true,
        unique: true,
        validate: {
            validator: function (v) {
                return validateEmail(v);
            },
            message: props => `${props.value} is not a valid email!`
        }
    },
    age: {
        type: Number,
        min: 0,
        max: 120
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

// Validate email format using regex
function validateEmail(email) {
    const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@(([^<>()\[\]\\.,;:\s@"]+\.)+[^<>()\[\]\\.,;:\s@"]{2,})$/i;
    return re.test(email);
}

// Export the User model
const User = mongoose.model('User', userSchema);
export default User;