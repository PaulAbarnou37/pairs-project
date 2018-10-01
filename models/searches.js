const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const moment = require("moment");

const searchSchema = new Schema({
  // document structure & rules
  owner: {
    type: Schema.Types.ObjectId,
    ref: "User", 
    required: true,
  },
  city: { type: String, required: true },
  startDate: {type : Date, required: true},
  endDate: {type: Date, required: true},
  selectedDays: {type: [String], required: true},
  maxPrice: {type: Number, required: true},
}, {
  // additional settings for Schema constructor function (class)
  timestamps: true,
});

searchSchema.virtual("getCreatedAt").get(function(){
  return moment(this.createdAt).format("YYYY-MM-DD ")
});

const Searches = mongoose.model("Searches", searchSchema);

module.exports = Searches;