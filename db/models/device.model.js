import mongoose from 'mongoose';

const deviceSchema = new mongoose.Schema(
  {
    device: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      required: true,
      default: 'offline',
    },
    room: {
      type: String,
      required: true,
      default: '',
    },
    description: {
      type: String,
      default: 'no description',
    },
    enabled: {
      type: Boolean,
      default: false,
    },
    image: {
      type: String,
      default: null,
    },
    power: {
      type: Number,
      default: 0,
    },
  },
  {
    versionKey: false,
    toJSON: {
      transform: (doc, ret) => {
        ret.id = ret._id;
        delete ret._id;
        return ret;
      },
    },
  },
);

const Device = mongoose.model('Device', deviceSchema);

export default Device;
