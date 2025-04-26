// File: src/models/TransportRoute.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { ITransportRoute } from '../types';

const TransportRouteSchema: Schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: String,
    stops: [{
        name: {
            type: String,
            required: true
        },
        time: {
            type: String,
            required: true
        },
        distance: Number
    }],
    vehicle: {
        type: Schema.Types.ObjectId,
        ref: 'TransportVehicle'
    },
    fare: {
        type: Number,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const TransportRoute = mongoose.model<ITransportRoute & Document>('TransportRoute', TransportRouteSchema);

export default TransportRoute;