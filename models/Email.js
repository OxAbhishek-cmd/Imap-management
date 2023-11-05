const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const EmailSchema = new Schema({
    user_id: {
        type: Schema.Types.ObjectId,
        ref: 'users'
    },
    name: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
    host: {
        type: String,
        required: true,
    },
    port: {
        type: Number,
        required: true,
        default: 993
    },
    action: {
        type: Boolean,
        required: true,
    },
    order: {
        type: Number
    },
    mailboxtree: {
        type: [String],
        default: []
    }
});

const User = mongoose.model('users');

EmailSchema.pre('save', async function (next) {
    if (this.isNew) {
        try {
            // Find the highest order value for the specific user and increment it
            const highestOrderEmail = await this.constructor.findOne({ user_id: this.user_id }, {}, { sort: { order: -1 } });
            const newOrder = highestOrderEmail ? highestOrderEmail.order + 1 : 1;
            this.order = newOrder;

            // Update the count field in the User model
            const user = await User.findById(this.user_id);
            if (user) {
                user.count = newOrder;
                await user.save();
            }

            next();
        } catch (err) {
            next(err);
        }
    } else {
        next();
    }
});

module.exports = Email = mongoose.model('emails', EmailSchema);
