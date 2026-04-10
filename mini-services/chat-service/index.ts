import { createServer } from 'http'
import { Server } from 'socket.io'

const httpServer = createServer()
const io = new Server(httpServer, {
  path: '/',
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  },
  pingTimeout: 60000,
  pingInterval: 25000,
})

// Types
interface User {
  id: string
  userId: string
  username: string
  role: string
  avatar?: string
}

interface Message {
  id: string
  conversationId: string
  senderId: string
  senderName: string
  senderRole: string
  content: string
  timestamp: Date
  type: 'text' | 'system'
  read: boolean
}

interface Conversation {
  id: string
  type: 'direct' | 'group'
  name?: string
  participants: string[]
  lastMessage?: Message
  unreadCount: Record<string, number>
}

interface TypingUser {
  userId: string
  username: string
  conversationId: string
}

// In-memory storage
const users = new Map<string, User>()
const conversations = new Map<string, Conversation>()
const typingUsers = new Map<string, TypingUser[]>()

// Helper functions
const generateId = () => Math.random().toString(36).substr(2, 9)

const createSystemMessage = (conversationId: string, content: string): Message => ({
  id: generateId(),
  conversationId,
  senderId: 'system',
  senderName: 'System',
  senderRole: 'system',
  content,
  timestamp: new Date(),
  type: 'system',
  read: true
})

const createUserMessage = (conversationId: string, senderId: string, senderName: string, senderRole: string, content: string): Message => ({
  id: generateId(),
  conversationId,
  senderId,
  senderName,
  senderRole,
  content,
  timestamp: new Date(),
  type: 'text',
  read: false
})

// Create default group conversations
const defaultGroups = [
  { id: 'general', name: 'General', type: 'group' as const },
  { id: 'announcements', name: 'Announcements', type: 'group' as const },
  { id: 'cs-capstone', name: 'CS Capstone 2026', type: 'group' as const },
]

defaultGroups.forEach(group => {
  conversations.set(group.id, {
    id: group.id,
    type: group.type,
    name: group.name,
    participants: [],
    unreadCount: {}
  })
})

io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`)

  // User authentication/join
  socket.on('authenticate', (data: { userId: string; username: string; role: string; avatar?: string }) => {
    const { userId, username, role, avatar } = data
    
    const user: User = {
      id: socket.id,
      userId,
      username,
      role,
      avatar
    }
    
    users.set(socket.id, user)
    socket.data.user = user
    
    // Join user to their personal room
    socket.join(`user:${userId}`)
    
    // Auto-join default groups
    defaultGroups.forEach(group => {
      socket.join(`conversation:${group.id}`)
      const conv = conversations.get(group.id)
      if (conv && !conv.participants.includes(userId)) {
        conv.participants.push(userId)
      }
    })
    
    // Send user their conversations
    const userConversations = Array.from(conversations.values())
      .filter(c => c.participants.includes(userId) || c.type === 'group')
    
    socket.emit('authenticated', { 
      user, 
      conversations: userConversations,
      users: Array.from(users.values())
    })
    
    // Notify others of user online status
    socket.broadcast.emit('user-online', { userId, username })
    
    console.log(`${username} (${role}) authenticated`)
  })

  // Get all users
  socket.on('get-users', () => {
    socket.emit('users-list', { users: Array.from(users.values()) })
  })

  // Create or get direct conversation
  socket.on('get-direct-conversation', (data: { targetUserId: string }) => {
    const user = socket.data.user as User
    if (!user) return
    
    const { targetUserId } = data
    const conversationId = [user.userId, targetUserId].sort().join('-')
    
    let conversation = conversations.get(conversationId)
    if (!conversation) {
      conversation = {
        id: conversationId,
        type: 'direct',
        participants: [user.userId, targetUserId],
        unreadCount: {}
      }
      conversations.set(conversationId, conversation)
    }
    
    socket.join(`conversation:${conversationId}`)
    
    // Also join target user if online
    const targetSocket = Array.from(users.values()).find(u => u.userId === targetUserId)
    if (targetSocket) {
      io.to(targetSocket.id).emit('new-conversation', { conversation })
    }
    
    socket.emit('conversation', { conversation })
  })

  // Create group conversation
  socket.on('create-group', (data: { name: string; participantIds: string[] }) => {
    const user = socket.data.user as User
    if (!user) return
    
    const { name, participantIds } = data
    const conversationId = generateId()
    
    const conversation: Conversation = {
      id: conversationId,
      type: 'group',
      name,
      participants: [user.userId, ...participantIds],
      unreadCount: {}
    }
    
    conversations.set(conversationId, conversation)
    
    // Join all participants
    socket.join(`conversation:${conversationId}`)
    participantIds.forEach(pid => {
      const participant = Array.from(users.values()).find(u => u.userId === pid)
      if (participant) {
        io.to(participant.id).emit('new-conversation', { conversation })
      }
    })
    
    socket.emit('conversation-created', { conversation })
    
    // System message
    const sysMsg = createSystemMessage(conversationId, `${user.username} created the group "${name}"`)
    io.to(`conversation:${conversationId}`).emit('message', sysMsg)
  })

  // Send message
  socket.on('send-message', (data: { conversationId: string; content: string }) => {
    const user = socket.data.user as User
    if (!user) return
    
    const { conversationId, content } = data
    const conversation = conversations.get(conversationId)
    
    if (!conversation) return
    
    const message = createUserMessage(conversationId, user.userId, user.username, user.role, content)
    
    // Update conversation last message
    conversation.lastMessage = message
    
    // Increment unread for other participants
    conversation.participants.forEach(pid => {
      if (pid !== user.userId) {
        conversation.unreadCount[pid] = (conversation.unreadCount[pid] || 0) + 1
      }
    })
    
    // Broadcast to conversation
    io.to(`conversation:${conversationId}`).emit('message', message)
    
    // Also notify users not in the conversation room
    conversation.participants.forEach(pid => {
      if (pid !== user.userId) {
        io.to(`user:${pid}`).emit('notification', {
          type: 'message',
          title: user.username,
          body: content.substring(0, 50),
          conversationId
        })
      }
    })
    
    console.log(`Message in ${conversationId}: ${user.username}: ${content.substring(0, 30)}...`)
  })

  // Typing indicator
  socket.on('typing', (data: { conversationId: string; isTyping: boolean }) => {
    const user = socket.data.user as User
    if (!user) return
    
    const { conversationId, isTyping } = data
    
    if (isTyping) {
      let typing = typingUsers.get(conversationId) || []
      if (!typing.find(t => t.userId === user.userId)) {
        typing.push({ userId: user.userId, username: user.username, conversationId })
        typingUsers.set(conversationId, typing)
      }
    } else {
      let typing = typingUsers.get(conversationId) || []
      typing = typing.filter(t => t.userId !== user.userId)
      typingUsers.set(conversationId, typing)
    }
    
    socket.to(`conversation:${conversationId}`).emit('typing', {
      conversationId,
      users: typingUsers.get(conversationId) || []
    })
  })

  // Mark as read
  socket.on('mark-read', (data: { conversationId: string }) => {
    const user = socket.data.user as User
    if (!user) return
    
    const { conversationId } = data
    const conversation = conversations.get(conversationId)
    
    if (conversation) {
      conversation.unreadCount[user.userId] = 0
      socket.emit('conversation-updated', { conversation })
    }
  })

  // Add member to group
  socket.on('add-member', (data: { conversationId: string; userId: string }) => {
    const user = socket.data.user as User
    if (!user || user.role === 'student') return // Only faculty/admin can add
    
    const { conversationId, userId } = data
    const conversation = conversations.get(conversationId)
    
    if (!conversation || conversation.type !== 'group') return
    
    conversation.participants.push(userId)
    
    const targetUser = Array.from(users.values()).find(u => u.userId === userId)
    if (targetUser) {
      io.to(targetUser.id).emit('added-to-group', { conversation })
    }
    
    const sysMsg = createSystemMessage(conversationId, `${user.username} added a member to the group`)
    io.to(`conversation:${conversationId}`).emit('message', sysMsg)
  })

  // Remove member from group
  socket.on('remove-member', (data: { conversationId: string; userId: string }) => {
    const user = socket.data.user as User
    if (!user || user.role === 'student') return
    
    const { conversationId, userId } = data
    const conversation = conversations.get(conversationId)
    
    if (!conversation || conversation.type !== 'group') return
    
    conversation.participants = conversation.participants.filter(p => p !== userId)
    
    const targetUser = Array.from(users.values()).find(u => u.userId === userId)
    if (targetUser) {
      io.to(targetUser.id).emit('removed-from-group', { conversationId })
    }
    
    const sysMsg = createSystemMessage(conversationId, `${user.username} removed a member from the group`)
    io.to(`conversation:${conversationId}`).emit('message', sysMsg)
  })

  // Leave group
  socket.on('leave-group', (data: { conversationId: string }) => {
    const user = socket.data.user as User
    if (!user) return
    
    const { conversationId } = data
    const conversation = conversations.get(conversationId)
    
    if (!conversation || conversation.type !== 'group') return
    
    conversation.participants = conversation.participants.filter(p => p !== user.userId)
    socket.leave(`conversation:${conversationId}`)
    
    const sysMsg = createSystemMessage(conversationId, `${user.username} left the group`)
    io.to(`conversation:${conversationId}`).emit('message', sysMsg)
  })

  // Disconnect
  socket.on('disconnect', () => {
    const user = socket.data.user as User
    
    if (user) {
      users.delete(socket.id)
      socket.broadcast.emit('user-offline', { userId: user.userId })
      console.log(`${user.username} disconnected`)
    } else {
      console.log(`User disconnected: ${socket.id}`)
    }
  })

  socket.on('error', (error) => {
    console.error(`Socket error (${socket.id}):`, error)
  })
})

const PORT = 3003
httpServer.listen(PORT, () => {
  console.log(`Chat WebSocket server running on port ${PORT}`)
})

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('Received SIGTERM signal, shutting down server...')
  httpServer.close(() => {
    console.log('Chat server closed')
    process.exit(0)
  })
})

process.on('SIGINT', () => {
  console.log('Received SIGINT signal, shutting down server...')
  httpServer.close(() => {
    console.log('Chat server closed')
    process.exit(0)
  })
})
