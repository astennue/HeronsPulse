'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, 
  Plus, 
  Hash, 
  Lock, 
  Send,
  Paperclip,
  Smile,
  MoreHorizontal,
  Users,
  UserPlus,
  Menu,
  X,
  ArrowLeft
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { getInitials, generateDefaultAvatar } from '@/lib/utils/avatar';

// Types
interface Channel {
  id: string;
  name: string;
  type: 'channel';
  isPrivate: boolean;
  unread: number;
  members: number;
}

interface DirectMessage {
  id: string;
  name: string;
  type: 'dm';
  isOnline: boolean;
  isPrivate: boolean;
  unread: number;
  members: number;
  avatarUrl?: string;
}

type Conversation = Channel | DirectMessage;

interface Message {
  id: string;
  sender: string;
  content: string;
  time: string;
  isOwn: boolean;
  avatarUrl?: string;
}

// Mock data
const channels: Channel[] = [
  { id: '1', name: 'general', type: 'channel', isPrivate: false, unread: 3, members: 24 },
  { id: '2', name: 'announcements', type: 'channel', isPrivate: false, unread: 0, members: 24 },
  { id: '3', name: 'cs-capstone-2026', type: 'channel', isPrivate: false, unread: 5, members: 8 },
  { id: '4', name: 'random', type: 'channel', isPrivate: false, unread: 0, members: 18 },
];

const directMessages: DirectMessage[] = [
  { id: '5', name: 'Prof. Demo Faculty', type: 'dm', isOnline: true, isPrivate: true, unread: 0, members: 2, avatarUrl: generateDefaultAvatar('Prof. Demo Faculty') },
  { id: '6', name: 'John Doe', type: 'dm', isOnline: false, isPrivate: true, unread: 2, members: 2, avatarUrl: generateDefaultAvatar('John Doe') },
  { id: '7', name: 'Maria Santos', type: 'dm', isOnline: true, isPrivate: true, unread: 0, members: 2, avatarUrl: generateDefaultAvatar('Maria Santos') },
];

const initialMessages: Message[] = [
  { id: '1', sender: 'Prof. Demo Faculty', content: 'Welcome to HeronPulse! Make sure to check your project deadlines.', time: '9:00 AM', isOwn: false, avatarUrl: generateDefaultAvatar('Prof. Demo Faculty') },
  { id: '2', sender: 'John Doe', content: 'Thanks for the update! I have a question about the database schema task.', time: '9:15 AM', isOwn: false, avatarUrl: generateDefaultAvatar('John Doe') },
  { id: '3', sender: 'You', content: 'I can help with that! What specifically do you need clarification on?', time: '9:20 AM', isOwn: true },
  { id: '4', sender: 'John Doe', content: 'Should we use UUID or auto-increment for primary keys?', time: '9:22 AM', isOwn: false, avatarUrl: generateDefaultAvatar('John Doe') },
  { id: '5', sender: 'You', content: 'I recommend UUID for distributed systems. Let me share the documentation.', time: '9:25 AM', isOwn: true },
];

// Invite Modal Component
function InviteModal({ open, onOpenChange, onInvite }: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  onInvite: (email: string, role: string) => void;
}) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('student');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      onInvite(email, role);
      setEmail('');
      onOpenChange(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-card rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md border"
      >
        <h2 className="text-lg font-semibold mb-4">Invite Team Member</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input
              type="email"
              placeholder="Enter email address..."
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="min-h-[44px]"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-3 border rounded-md bg-background min-h-[44px]"
            >
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!email.trim()}
              className="min-h-[44px] w-full sm:w-auto"
            >
              Send Invite
            </Button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function MessagesContent() {
  const [selectedChannel, setSelectedChannel] = useState<Conversation>(channels[0]);
  const [message, setMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Filter conversations based on search query
  const filteredChannels = useMemo(() => {
    if (!searchQuery.trim()) return channels;
    const query = searchQuery.toLowerCase();
    return channels.filter(channel => 
      channel.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const filteredDirectMessages = useMemo(() => {
    if (!searchQuery.trim()) return directMessages;
    const query = searchQuery.toLowerCase();
    return directMessages.filter(dm => 
      dm.name.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  const handleSelectChannel = (channel: Conversation) => {
    setSelectedChannel(channel);
    setShowMobileSidebar(false);
    // Focus input on mobile after selecting channel
    setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
  };

  const handleSendMessage = () => {
    if (!message.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'You',
      content: message.trim(),
      time: new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }),
      isOwn: true,
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    console.log('Message sent:', newMessage);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleInvite = (email: string, role: string) => {
    console.log('Sending invite to:', email, 'with role:', role);
  };

  const handleAddChannel = () => {
    console.log('Add new channel');
  };

  const handleAddDM = () => {
    console.log('Add new DM');
  };

  // Get total unread count
  const totalUnread = useMemo(() => {
    return [...channels, ...directMessages].reduce((acc, c) => acc + c.unread, 0);
  }, []);

  // Conversation list item component
  const ConversationItem = ({ item }: { item: Conversation }) => (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleSelectChannel(item)}
      className={cn(
        'w-full flex items-center gap-2 sm:gap-3 px-3 py-3 rounded-lg text-sm transition-colors touch-manipulation min-h-[52px]',
        selectedChannel.id === item.id 
          ? 'bg-primary/10 text-primary' 
          : 'hover:bg-muted text-muted-foreground hover:text-foreground'
      )}
    >
      {item.type === 'channel' ? (
        item.isPrivate ? (
          <Lock className="h-5 w-5 shrink-0" />
        ) : (
          <Hash className="h-5 w-5 shrink-0" />
        )
      ) : (
        <div className="relative">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            {'avatarUrl' in item && item.avatarUrl && (
              <AvatarImage src={item.avatarUrl} alt={item.name} />
            )}
            <AvatarFallback className="text-xs bg-primary text-primary-foreground">
              {getInitials(item.name)}
            </AvatarFallback>
          </Avatar>
          {'isOnline' in item && (
            <div className={cn(
              'absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-background',
              item.isOnline ? 'bg-green-500' : 'bg-gray-400'
            )} />
          )}
        </div>
      )}
      <span className="truncate flex-1 text-left font-medium">{item.name}</span>
      {item.unread > 0 && (
        <Badge variant="default" className="h-5 min-w-5 px-1.5 text-xs shrink-0">
          {item.unread}
        </Badge>
      )}
    </motion.button>
  );

  return (
    <div className="flex h-[calc(100vh-120px)] sm:h-[calc(100vh-120px)] gap-0 sm:gap-4 relative">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {showMobileSidebar && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 md:hidden"
              onClick={() => setShowMobileSidebar(false)}
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 w-[280px] max-w-[85vw] z-50 md:hidden"
            >
              <Card className="h-full glass-card rounded-none rounded-r-xl flex flex-col">
                <CardHeader className="pb-2 border-b">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Messages</CardTitle>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setShowMobileSidebar(false)}
                      className="h-10 w-10 min-h-[44px] min-w-[44px]"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                  <div className="relative mt-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="Search conversations..." 
                      className="pl-10 min-h-[44px]" 
                      value={searchQuery} 
                      onChange={(e) => setSearchQuery(e.target.value)} 
                    />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden p-0">
                  <ScrollArea className="h-full">
                    {/* Channels */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Channels</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 min-h-[44px] min-w-[44px]" 
                          onClick={handleAddChannel}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {filteredChannels.length === 0 ? (
                          <p className="text-xs text-muted-foreground px-3 py-2">No channels found</p>
                        ) : (
                          filteredChannels.map((channel) => (
                            <ConversationItem key={channel.id} item={channel} />
                          ))
                        )}
                      </div>
                    </div>

                    <Separator />

                    {/* Direct Messages */}
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2 px-1">
                        <span className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 min-h-[44px] min-w-[44px]" 
                          onClick={handleAddDM}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="space-y-1">
                        {filteredDirectMessages.length === 0 ? (
                          <p className="text-xs text-muted-foreground px-3 py-2">No messages found</p>
                        ) : (
                          filteredDirectMessages.map((dm) => (
                            <ConversationItem key={dm.id} item={dm} />
                          ))
                        )}
                      </div>
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <Card className="w-64 lg:w-72 glass-card flex-shrink-0 hidden md:flex flex-col">
        <CardHeader className="pb-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search conversations..." 
              className="pl-10 min-h-[44px]" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
        </CardHeader>
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full">
            {/* Channels */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Channels</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 min-h-[44px] min-w-[44px]" 
                  onClick={handleAddChannel}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {filteredChannels.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-3 py-2">No channels found</p>
                ) : (
                  filteredChannels.map((channel) => (
                    <ConversationItem key={channel.id} item={channel} />
                  ))
                )}
              </div>
            </div>

            <Separator />

            {/* Direct Messages */}
            <div className="p-3">
              <div className="flex items-center justify-between mb-2 px-1">
                <span className="text-xs font-semibold text-muted-foreground uppercase">Direct Messages</span>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 min-h-[44px] min-w-[44px]" 
                  onClick={handleAddDM}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-1">
                {filteredDirectMessages.length === 0 ? (
                  <p className="text-xs text-muted-foreground px-3 py-2">No messages found</p>
                ) : (
                  filteredDirectMessages.map((dm) => (
                    <ConversationItem key={dm.id} item={dm} />
                  ))
                )}
              </div>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Main Chat Area */}
      <Card className="flex-1 glass-card flex flex-col min-w-0 rounded-none sm:rounded-lg">
        {/* Header */}
        <CardHeader className="border-b py-3 px-4">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              {/* Mobile menu button */}
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 min-h-[44px] min-w-[44px] md:hidden shrink-0"
                onClick={() => setShowMobileSidebar(true)}
              >
                <Menu className="h-5 w-5" />
                {totalUnread > 0 && (
                  <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center">
                    {totalUnread > 9 ? '9+' : totalUnread}
                  </span>
                )}
              </Button>
              
              {selectedChannel.type === 'channel' ? (
                <Hash className="h-5 w-5 text-muted-foreground shrink-0 hidden sm:block" />
              ) : (
                <Avatar className="h-8 w-8 shrink-0 hidden sm:flex">
                  {'avatarUrl' in selectedChannel && selectedChannel.avatarUrl && (
                    <AvatarImage src={selectedChannel.avatarUrl} alt={selectedChannel.name} />
                  )}
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    {getInitials(selectedChannel.name)}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0">
                <CardTitle className="text-base sm:text-lg truncate">
                  {selectedChannel.type === 'channel' ? (
                    <span className="flex items-center gap-2">
                      <Hash className="h-4 w-4 sm:hidden" />
                      {selectedChannel.name}
                    </span>
                  ) : (
                    selectedChannel.name
                  )}
                </CardTitle>
                {selectedChannel.type === 'channel' && 'members' in selectedChannel && (
                  <p className="text-xs text-muted-foreground hidden sm:block">
                    {selectedChannel.members} members
                  </p>
                )}
              </div>
              {selectedChannel.type === 'channel' && 'members' in selectedChannel && (
                <Badge variant="secondary" className="text-xs hidden sm:flex shrink-0">
                  <Users className="h-3 w-3 mr-1" />
                  {selectedChannel.members}
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-1 sm:gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsInviteModalOpen(true)}
                className="min-h-[44px] hidden sm:flex"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Invite
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setIsInviteModalOpen(true)}
                className="min-h-[44px] min-w-[44px] sm:hidden"
              >
                <UserPlus className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon"
                className="h-10 w-10 min-h-[44px] min-w-[44px]"
                onClick={() => console.log('More options clicked')}
              >
                <MoreHorizontal className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages */}
        <CardContent className="flex-1 overflow-hidden p-0">
          <ScrollArea className="h-full p-3 sm:p-4" ref={scrollRef}>
            <AnimatePresence>
              <div className="space-y-3 sm:space-y-4">
                {messages.map((msg, index) => (
                  <motion.div
                    key={msg.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ delay: index * 0.05 }}
                    className={cn(
                      'flex gap-2 sm:gap-3',
                      msg.isOwn && 'flex-row-reverse'
                    )}
                  >
                    <Avatar className="h-8 w-8 sm:h-9 sm:w-9 shrink-0">
                      {msg.avatarUrl && !msg.isOwn && (
                        <AvatarImage src={msg.avatarUrl} alt={msg.sender} />
                      )}
                      <AvatarFallback className={cn(
                        msg.isOwn ? 'bg-primary text-primary-foreground' : 'bg-muted'
                      )}>
                        {msg.isOwn ? 'Y' : getInitials(msg.sender)}
                      </AvatarFallback>
                    </Avatar>
                    <div className={cn(
                      'flex flex-col gap-1 max-w-[75%] sm:max-w-[70%]',
                      msg.isOwn && 'items-end'
                    )}>
                      <div className="flex items-center gap-2 flex-wrap">
                        {!msg.isOwn && (
                          <span className="text-sm font-medium">{msg.sender}</span>
                        )}
                        <span className="text-xs text-muted-foreground">{msg.time}</span>
                      </div>
                      <div className={cn(
                        'px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl text-sm sm:text-base',
                        msg.isOwn 
                          ? 'bg-primary text-primary-foreground rounded-br-md' 
                          : 'bg-muted rounded-bl-md'
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
        <div className="border-t p-3 sm:p-4">
          <div className="flex items-end gap-2">
            <Button 
              variant="ghost" 
              size="icon"
              className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0"
              onClick={() => console.log('Attachment clicked')}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            <div className="flex-1 relative">
              <Input
                ref={inputRef}
                placeholder="Type a message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="min-h-[44px] pr-12"
              />
              <Button 
                variant="ghost" 
                size="icon"
                className="absolute right-1 top-1/2 -translate-y-1/2 h-9 w-9 min-h-[44px] min-w-[44px]"
                onClick={() => console.log('Emoji picker clicked')}
              >
                <Smile className="h-5 w-5" />
              </Button>
            </div>
            <Button 
              size="icon"
              disabled={!message.trim()} 
              onClick={handleSendMessage}
              className="h-11 w-11 min-h-[44px] min-w-[44px] shrink-0"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Invite Modal */}
      <InviteModal
        open={isInviteModalOpen}
        onOpenChange={setIsInviteModalOpen}
        onInvite={handleInvite}
      />
    </div>
  );
}
