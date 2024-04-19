import { ObjectId } from 'mongodb'
import { Server } from 'socket.io'
import http from 'http'
import Conversation from '~/models/schemas/Conversation.schema'
import databaseService from '~/services/db.service'

export default function initSocket(httpServer: http.Server) {
  const io = new Server(httpServer, {
    /* options */
    cors: {
      origin: 'http://localhost:3000'
    }
  })

  const users: { [key: string]: { socket_id: string } } = {}
  io.on('connection', (socket) => {
    // check connection status
    console.log(`User with ID ${socket.id} connected`)
    const user_id = socket.handshake.auth.user_id
    if (user_id) {
      users[user_id] = { socket_id: socket.id }
    }

    socket.on('private message', async (data: { content: string; to: string; from: string }) => {
      const receiver_socket_id = users[data.to]?.socket_id
      // insert conversation to database
      await databaseService.conversation.insertOne(
        new Conversation({
          content: data.content,
          receiver_id: new ObjectId(data.to),
          sender_id: new ObjectId(data.from)
        })
      )
      // emit to receiver
      socket.to(receiver_socket_id).emit('receive private message', {
        content: data.content,
        from: user_id
      })
    })
    // check disconnection status
    socket.on('disconnect', () => {
      delete users[user_id]
      console.log(`User with ID ${socket.id} disconnected`)
    })
  })
}
