import { Schema, model, models } from 'mongoose';

const ReplyingToSchema = new Schema({
  cid: {
    type: String,
    required: true,
    immutable: true,
  },
  address: {
    type: String,
    required: true,
    immutable: true,
  },
});

const PostSchema = new Schema({
  creator: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Creator is required'],
    immutable: true,
  },
  cid: {
    type: String,
    required: [true, 'cid is required'],
    immutable: true,
  },
  timestamp: {
    type: Date,
    required: [true, 'Time is required'],
    immutable: true,
  },
  replyingTo: [ReplyingToSchema],
});

const Post = models.Post || model('Post', PostSchema);

export default Post;
