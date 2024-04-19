import { ObjectId } from 'mongodb'
import databaseService from './db.service'

class ConversationService {
  async getConversations({
    limit,
    page,
    receiver_id,
    sender_id
  }: {
    sender_id: ObjectId
    receiver_id: ObjectId
    page: number
    limit: number
  }) {
    const conversations = await databaseService.conversation
      .find(
        {
          $or: [
            {
              sender_id: sender_id,
              receiver_id: receiver_id
            },
            {
              sender_id: receiver_id,
              receiver_id: sender_id
            }
          ]
        },
        {
          limit,
          skip: limit * (page - 1),
          sort: { created_at: -1 }
        }
      )
      .toArray()
    return conversations
  }
}

const conversationService = new ConversationService()
export default conversationService
