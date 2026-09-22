import mongoose, { Schema, model } from 'mongoose';
import { IContact } from '../interfaces/contact.interface.js';

const contactSchema: Schema<IContact> = new Schema<IContact>(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true
    },
    phone: {
      type: String,
      default: ''
    },
    message: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['new', 'replied', 'closed'],
      default: 'new'
    }
  },
  { timestamps: true }
);

const contactModel = mongoose.models.contact || model('contact', contactSchema);

export default contactModel;
