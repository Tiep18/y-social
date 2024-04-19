import { ObjectId } from 'mongodb'

export interface ConversationType {
  _id?: ObjectId
  content: string
  sender_id: ObjectId
  receiver_id: ObjectId
  created_at?: Date
  updated_at?: Date
}

export default class Conversation {
  _id?: ObjectId
  content: string
  sender_id: ObjectId
  receiver_id: ObjectId
  created_at?: Date
  updated_at?: Date
  constructor({ sender_id, receiver_id, _id, created_at, updated_at, content }: ConversationType) {
    const now = new Date()
    this._id = _id
    this.content = content
    this.sender_id = sender_id
    this.receiver_id = receiver_id
    this.created_at = created_at || now
    this.updated_at = updated_at || now
  }
}
