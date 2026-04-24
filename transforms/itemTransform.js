import { Transform } from 'stream';

export const itemStatusTransform = new Transform({
  objectMode: true,
  transform(item, encoding, callback) {
    this.push({
      ...item,
      isActive: item.status === 'on',
    });
    callback();
  },
});
