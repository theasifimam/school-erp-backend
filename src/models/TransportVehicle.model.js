// File: src/models/TransportVehicle.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ITransportVehicle } from '../types';

const TransportVehicleSchema: Schema = new Schema({
    vehicleNumber: {
        type: String,
        required: true,
        unique: true
    },
    vehicleType: {
        type: String,
        enum: ['bus', 'van', 'other'],
        required: true
    },
    capacity: {
        type: Number,
        required: true
    },
    driver: {
        name: {
            type: String,
            required: true
        },
        licenseNumber: {
            type: String,
            required: true
        },
        contactNumber: {
            type: String,
            required: true
        },
        address: String
    },
    route: {
        type: Schema.Types.ObjectId,
        ref: 'TransportRoute'
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const TransportVehicle = mongoose.model<ITransportVehicle & Document>('TransportVehicle', TransportVehicleSchema);

export default TransportVehicle;