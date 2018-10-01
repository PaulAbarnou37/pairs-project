const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema({
  // document structure & rules
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  dateOfBirth: { type: Date, required: true },
  description: { type: String, required: true, minlength: 100 },
  fbProfile: { type: String },
  linkedInProfile: { type: String },
  searches:[
              {
                type: Schema.Types.ObjectId,
                ref: "Searches", 
              }
            ],
  email: {
    type: String,
    required: true,
    unique: true,
    match: /^.+@.+\..+$/,
  },
  encryptedPassword: { type: String, required: true },
  avatar: { type: String }
}, {
  // additional settings for Schema constructor function (class)
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;