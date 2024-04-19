import { Request, Response } from 'express'
import { ObjectId } from 'mongodb'
import conversationService from '~/services/conversation.service'

export const getConversationsControllers = async (req: Request, res: Response) => {
  const page = Number(req.query.page)
  const limit = Number(req.query.limit)
  const sender_id = new ObjectId(req.decoded_authorization?.user_id)
  const receiver_id = new ObjectId(req.params.receiver_id)
  const result = await conversationService.getConversations({ sender_id, receiver_id, page, limit })
  return res.json({
    message: 'Get conversations successfully',
    result
  })
}
