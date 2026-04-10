'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Hash, 
  Lock, 
  MessageSquare, 
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  User,
  Users
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Mock data
const channels = [
  { id: '1', name: 'general', type: 'channel', isPrivate: false, unread: 3, members: 24 },
  { id: '2', name: 'announcements', type: 'channel', isPrivate: false, unread: 0, members: 24 },
  { id: '3', name: 'cs-capstone-2026', type: 'channel', isPrivate: false, unread: 5, members: 8 },
  { id: '4', name: 'random', type: 'channel', isPrivate: false, unread: 0, members: 18 },
];

const directMessages = [
  { id: '5', name: 'Prof. Demo Faculty', type: 'dm', isOnline: true, avatar: null },
  { id: '6', name: 'John Doe', type: 'dm', isOnline: false, avatar: null },
  { id: '7', name: 'Maria Santos', type: 'dm', isOnline: true, avatar: null },
];

const messages = [
  { id: '1', sender: 'Prof. Demo Faculty', avatar: null, content: 'Welcome to HeronPulse! Make sure to check your project deadlines.', time: '9:00 AM', isOwn: false },
  { id: '2', sender: 'John Doe', avatar: null, content: 'Thanks for the update! I have a question about the database schema task.', time: '9:15 AM', isOwn: false },
  { id: '3', sender: 'You', avatar: null, content: 'I can help with that! What specifically do you need clarification on?', time: '9:20 AM', isOwn: true },
  { id: '4', sender: 'John Doe', avatar: null, content: 'Should we use UUID or auto-increment for primary keys?', time: '9:22 AM', isOwn: false },
  { id: '5', sender: 'You', avatar: null, content: 'I recommend UUID for distributed systems. Let me share the documentation.', time: '9:25 AM', isOwn: true },
];

export default function MessagesPage() {
  const [selectedChannel, setSelectedChannel] = useState(channels[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Sidebar */}
      <Card className="w-64 glass-card flex-shrink-0 hidden md:flex flex-col">
        <CardHeader className="pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Search..." className="pl-10" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            {/* Channels */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Channels</span>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {channels.map((channel) => (
                  <motion.button
                    key={channel.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedChannel(channel)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                      selectedChannel.id === channel.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    {channel.isPrivate ? (
                      <Lock className="h-4 w-4 shrink-0" />
                    ) : (
                      <Hash className="h-4 w-4 shrink-0" />
                    )}
                    <span className="truncate flex-1 text-left">{channel.name}</span>
                    {channel.unread > 0 && (
                      <Badge variant="default" className="h-5 min-w-5 px-1 text-xs">
                        {channel.unread}
                      </Badge>
                    )}
                  </motion.button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Direct Messages */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</span>
                <Button variant="ghost" size="icon" className="h-5 w-5">
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="space-y-1">
                {directMessages.map((dm) => (
                  <motion.button
                    key={dm.id}
                    whileHover={{ x: 4 }}
                    onClick={() => setSelectedChannel(dm)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-sm transition-colors',
                      selectedChannel.id === dm.id 
                        ? 'bg-primary/10 text-primary' 
                        : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                    )}
                  >
                    <div className="relative">
                      <Avatar className="h-6 w-6">
                        <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                          {dm.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div className={cn(
                        'absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full border-2 border-background',
                        dm.isOnline ? 'bg-green-500' : 'bg-gray-400'
                      )} />
                    </div>
                    <span className="truncate flex-1 text-left">{dm.name}</span>
                  </motion.button>
                ))}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 glass-card flex flex-col">
        {/* Header */}
        <CardHeader className="border-b py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {selectedChannel.type === 'channel' ? (
                <Hash className="h-5 w-5 text-muted-foreground" />
              ) : (
                <Avatar className="h-6 w-6">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {selectedChannel.name.split(' ').map((n: string) => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
              )}
              <CardTitle className="text-base">{selectedChannel.name}</CardTitle>
              {selectedChannel.type === 'channel' && (
                <Badge variant="secondary" className="text-xs">
                  <Users className="h-3 w-3 mr-1" />
                  {selectedChannel.members}
                </Badge>
              )}
            </div>
            <Button variant="ghost" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-4">
            <AnimatePresence>
              <div className="space-y-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex gap-3',
                      msg.isOwn && 'flex-row-reverse'
                    )}
                  >
                    <Avatar className="h-8 w-8 shrink-0">
                      <AvatarFallback className={cn(
                        msg.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        {msg.isOwn ? 'Y' : msg.sender.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      'flex flex-col gap-1 max-w-[70%]',
                      msg.isOwn && 'items-end'
                    )}>
                      <div className="flex items-center gap-2">
                        {!msg.isOwn && (
                          <span className="text-sm font-medium">{msg.sender}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <div className={cn(
                        'px-3 py-2 rounded-lg text-sm',
                        msg.isOwn 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      )}>
                        {msg.content}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </ScrollArea>
        </CardContent>

        {/* Message Input */}
        <div className="border-t p-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon">
              <Paperclip className="h-4 w-4" />
            </Button>
            <Input
              placeholder="Type a message..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1"
            />
            <Button variant="ghost" size="icon">
              <Smile className="h-4 w-4" />
            </Button>
            <Button size="icon" disabled={!message.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
