const mongoose = require('mongoose');

const Schema = mongoose.Schema;


var vehicleModelSchema = new Schema({
    aboutCar: { type: String },
    carTypeId: { type: Schema.ObjectId, ref: 'vehicleType' },
    vehicleTypeId: { type: Schema.ObjectId, ref: 'carCategory' },
    vehicleModel: { type: String },
    color: { type: String, },
    chassis: { type: String, },
    engine: { type: String, },
    ownerId: { type: Schema.ObjectId, ref: 'owner' },
    condition: { type: String, },
    steering: { type: String, default: ''},
    makeOfCar: { type: String, },
    speed: { type: String, default: ''},
    passenger: { type: Number, default: ''},
    transmission: { type: String },
    hourlyRate: { type: Number },
    dayRate: { type: Number },
    carName: { type: String, default: '' },
    date: { type: Number },
    currentLat: { type: Number },
    isDeleted: { type: Boolean, default: false },
    currentLong: { type: Number },
    place: { type: String },
    safe: {
        type: Boolean,
        default: false
    },
    // [{ type: Schema.ObjectId, ref: 'event' }]
    events: {type:Array,ref: 'event'},
    location: {
        type: {
            type: String, default: "Point"
        },

        coordinates: [Number]
    }
}, { timestamps: true })

vehicleModelSchema.set('toObject', { virtuals: true });
vehicleModelSchema.set('toJSON', { virtuals: true });
vehicleModelSchema.virtual('vehicleImages', {
    ref: 'vehicleImage',
    localField: '_id',
    foreignField: 'vehcileId'
})


module.exports = mongoose.model('vehicle', vehicleModelSchema);