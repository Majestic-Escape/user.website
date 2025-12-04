'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { MessageCircle, PenSquare, Search, Settings, Paperclip, File, Send } from 'lucide-react'
import { useState, useEffect, useRef } from "react"
import Image from "next/image"

type Message = {
  id: string
  content: string
  timestamp: string
  sender: string
  type: 'message' | 'notification' | 'image' | 'file'
  fileUrl?: string
  date?: string
  fileName?: string
  fileSize?: number
}

type Chat = {
  id: string
  name: string
  title?: string
  message: string
  time: string
  unread: number
  isStarred: boolean
  image: string
  status: 'error' | 'seen' | 'delivered' | 'sent' | 'unread'
  messages: Message[]
  isOnline?: boolean
}

// const initialChats: Chat[] = [
//   {
//     id: "1",
//     name: "Priya Sharma",
//     title: "Host - Taj View Villa",
//     message: "Your booking for Taj View Villa is confirmed for July 15-20.",
//     time: "07:21",
//     unread: 0,
//     isStarred: false,
//     image: "/images/testimonials/kavita.png?height=40&width=40",
//     status: 'seen',
//     isOnline: true,
//     messages: [
//       { id: "1", content: "Namaste! Welcome to Majestic Escape. How may I assist you today?", timestamp: "10:30 AM", sender: "Priya Sharma", type: 'message', date: "Jul 10, 2024" },
//       { id: "2", content: "Namaste! I'm interested in booking Taj View Villa for July 15-20. Is it available?", timestamp: "11:15 AM", sender: "user", type: 'message', date: "Jul 10, 2024" },
//       { id: "3", content: "Great news! Taj View Villa is available for those dates. Would you like to proceed with the booking?", timestamp: "11:30 AM", sender: "Priya Sharma", type: 'message', date: "Jul 10, 2024" },
//       { id: "4", content: "Yes, please! How do I confirm the booking?", timestamp: "11:45 AM", sender: "user", type: 'message', date: "Jul 10, 2024" },
//       { id: "5", content: "Your booking for Taj View Villa is confirmed for July 15-20. I've sent you the details via email. Let me know if you need anything else!", timestamp: "12:00 PM", sender: "Priya Sharma", type: 'message', date: "Jul 10, 2024" },
//     ]
//   },
//   { id: "2", name: "Arjun Patel", title: "Host - Himalayan Retreat", message: "Don't forget to bring warm clothes for your stay in the mountains!", time: "09:20", unread: 1, isStarred: true, image: "/images/testimonials/vikram.png?height=40&width=40", status: 'unread', messages: [] },
//   { id: "3", name: "Meera Reddy", title: "Guest Services", message: "Your Ayurvedic spa appointment is scheduled for 3 PM tomorrow.", time: "08:43", unread: 0, isStarred: false, image: "/images/testimonials/anjali.png?height=40&width=40", status: 'delivered', messages: [] },
//   { id: "4", name: "Rahul Kapoor", title: "Host - Backwater Houseboat", message: "The houseboat is ready for your Kerala backwater tour. Enjoy!", time: "10:00", unread: 3, isStarred: false, image: "/images/testimonials/rahul.png?height=40&width=40", status: 'sent', messages: [] },
//   { id: "5", name: "Ananya Desai", title: "Concierge", message: "Your dinner reservation at the rooftop Mughlai restaurant is confirmed for 7 PM.", time: "Yesterday", unread: 0, isStarred: true, image: "/images/testimonials/vikram.png?height=40&width=40", status: 'seen', messages: [] },
// ]


const initialChats :Chat[]=[] 
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];

export default function Component() {
  const [activeFilter, setActiveFilter] = useState<'all' | 'unread' | 'starred'>('all')
  const [chats, setChats] = useState<Chat[]>(initialChats)
  const [selectedChat, setSelectedChat] = useState<Chat | null>(null)
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const chatContainerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (selectedChat) {
      setChats(prevChats => 
        prevChats.map(chat => 
          chat.id === selectedChat.id ? { ...chat, unread: 0 } : chat
        )
      )
    }
  }, [selectedChat])

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [selectedChat?.messages])

  const filteredChats = chats.filter(chat => {
    const matchesFilter = 
      activeFilter === 'all' ||
      (activeFilter === 'unread' && chat.unread > 0) ||
      (activeFilter === 'starred' && chat.isStarred)

    const matchesSearch = 
      chat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chat.messages.some(message => 
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )

    return matchesFilter && matchesSearch
  })

  const handleChatClick = (chat: Chat) => {
    setSelectedChat(chat)
    setChats(prevChats => 
      prevChats.map(c => 
        c.id === chat.id ? { ...c, unread: 0 } : c
      )
    )
  }

  const handleSendMessage = () => {
    if (newMessage.trim() === '' && !fileInputRef.current?.files?.length) return

    const now = new Date()
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const date = now.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

    let newMessageObj: Message

    if (fileInputRef.current?.files?.length) {
      const file = fileInputRef.current.files[0]
      if (file.size > MAX_FILE_SIZE) {
        alert('File size exceeds the maximum limit of 5MB.')
        return
      }
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        alert('File type not supported.')
        return
      }
      const fileUrl = URL.createObjectURL(file)
      newMessageObj = {
        id: Date.now().toString(),
        content: file.name,
        timestamp,
        sender: 'user',
        type: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl,
        date,
        fileName: file.name,
        fileSize: file.size
      }
    } else {
      newMessageObj = {
        id: Date.now().toString(),
        content: newMessage,
        timestamp,
        sender: 'user',
        type: 'message',
        date
      }
    }

    if (selectedChat) {
      setChats(prevChats =>
        prevChats.map(chat =>
          chat.id === selectedChat.id
            ? {
                ...chat,
                messages: [...chat.messages, newMessageObj],
                message: newMessageObj.content,
                time: timestamp
              }
            : chat
        )
      )
      setSelectedChat(prevChat => ({
        ...prevChat!,
        messages: [...prevChat!.messages, newMessageObj],
        message: newMessageObj.content,
        time: timestamp
      }))
    }

    setNewMessage('')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const handleFileUpload = () => {
    fileInputRef.current?.click()
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B'
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB'
    else return (bytes / 1048576).toFixed(1) + ' MB'
  }

  return (
    
    <div className="h-screen w-screen  bg-white font-poppins">
      {/* Main Content */}
      <div className="grid container  max-w-[1400px] mx-auto md:grid-cols-[350px_1fr] grid-cols-1">
        {/* Sidebar */}
        <div   className="border-r h-[calc(100vh-64px)] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 scroll-none" >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg text-bricolage font-semibold">Chats</h2>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primaryGreen">
                  <PenSquare className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="text-gray-500 hover:text-primaryGreen">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search or start a new chat"
                className="pl-8 bg-lighterGreen border-none rounded-lg focus-visible:ring-2 focus-visible:ring-primaryGreen focus-visible:ring-offset-0"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <div className="p-2">
            <div className="flex flex-wrap gap-1 mb-4 px-2">
              <Button
                variant={activeFilter === 'all' ? "default" : "ghost"}
                size="sm"
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  activeFilter === 'all'
                    ? 'bg-primaryGreen text-white hover:bg-primaryGreen/90'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setActiveFilter('all')}
              >
                All
              </Button>
              <Button
                variant={activeFilter === 'unread' ? "default" : "ghost"}
                size="sm"
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  activeFilter === 'unread'
                    ? 'bg-primaryGreen text-white hover:bg-primaryGreen/90'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setActiveFilter('unread')}
              >
                Unread
              </Button>
              <Button
                variant={activeFilter === 'starred' ? "default" : "ghost"}
                size="sm"
                className={`rounded-full px-3 py-1 text-sm font-medium transition-colors ${
                  activeFilter === 'starred'
                    ? 'bg-primaryGreen text-white hover:bg-primaryGreen/90'
                    : 'bg-transparent text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
                onClick={() => setActiveFilter('starred')}
              >
                Starred
              </Button>
            </div>
            <div className="space-y-3">
              {filteredChats.map((chat) => (
                <Card 
                  key={chat.id} 
                  className={`px-3 py-5 shadow-none bg-gray-50 rounded-2xl hover:bg-lightGreen/30 cursor-pointer rounded-lg border-none ${selectedChat?.id === chat.id ? 'bg-gray-50' : ''}`}
                  onClick={() => handleChatClick(chat)}
                >
                  <div className="flex gap-3">
                    <Avatar>
                      <AvatarImage src={chat.image} />
                      <AvatarFallback>{chat.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <span className="font-medium">{chat.name}</span>
                        <span className="text-xs text-gray-500">{chat.time}</span>
                      </div>
                      <p className="text-xs text-gray-500">{chat.title}</p>
                      <p className="text-sm text-gray-500 truncate">{chat.message}</p>
                    </div>
                    {chat.unread > 0 && (
                      <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primaryGreen text-white text-xs">
                        {chat.unread}
                      </div>
                    )}
                    {chat.unread === 0 && chat.isStarred && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" className="text-yellow-400">
                        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                      </svg>
                    )}
                    {chat.unread === 0 && !chat.isStarred && chat.status === 'seen' && (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-500">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Chat Area */}
        {selectedChat ? (
          <div className="flex flex-col h-[calc(100vh-64px)]">
            {/* Chat Header */}
            <div className="flex items-center gap-3 p-4 border-b">
              <Avatar className="h-10 w-10">
                <AvatarImage src={selectedChat.image} />
                <AvatarFallback>{selectedChat.name.split(" ").map(n => n[0]).join("")}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h2 className="font-semibold">{selectedChat.name}</h2>
                  {selectedChat.isOnline && (
                    <div className="h-2 w-2 rounded-full bg-green-500" />
                  )}
                </div>
                {selectedChat.title && (
                  <p className="text-sm text-gray-500">{selectedChat.title}</p>
                )}
              </div>
              <Button variant="ghost" size="icon">
                <Search className="h-4 w-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 space-y-4">
              {selectedChat.messages.map((message, index) => (
                <div key={message.id} className="flex flex-col">
                  {(index === 0 || message.date !== selectedChat.messages[index - 1].date) && (
                    <div className="flex justify-center my-2">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {message.date}
                      </span>
                    </div>
                  )}
                  {message.type === 'notification' ? (
                    <div className="flex justify-center">
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        {message.sender} {message.content}
                      </span>
                    </div>
                  ) : message.type === 'image' ? (
                    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${message.sender === 'user' ? 'bg-primaryGreen' : 'bg-gray-100'} rounded-2xl p-2`}>
                        <div className="relative w-full" style={{ maxWidth: '300px', maxHeight: '200px' }}>
                          <Image
                            src={message.fileUrl || ''}
                            alt="Attached image"
                            layout="responsive"
                            width={300}
                            height={200}
                            objectFit="contain"
                            className="rounded"
                          />
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-white">{message.fileName}</span>
                          <span className="text-xs text-white">{formatFileSize(message.fileSize || 0)}</span>
                        </div>
                        <span className="text-[10px] opacity-70 mt-1 block text-white">{message.timestamp}</span>
                      </div>
                    </div>
                  ) : message.type === 'file' ? (
                    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${message.sender === 'user' ? 'bg-primaryGreen text-white' : 'bg-gray-100'} rounded-2xl px-4 py-2`}>
                        <div className="flex items-center gap-2">
                          <File className="h-4 w-4" />
                          <span className="text-sm">{message.fileName}</span>
                        </div>
                        <div className="mt-1 flex justify-between items-center">
                          <span className="text-xs">{formatFileSize(message.fileSize || 0)}</span>
                          <a href={message.fileUrl} download className="text-xs underline">Download</a>
                        </div>
                        <span className="text-[10px] opacity-70 mt-1 block">{message.timestamp}</span>
                      </div>
                    </div>
                  ) : (
                    <div className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${message.sender === 'user' ? 'bg-primaryGreen text-white' : 'bg-gray-100'} rounded-2xl px-4 py-2`}>
                        <p className="text-sm">{message.content}</p>
                        <span className="text-[10px] opacity-70 mt-1 block">{message.timestamp}</span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t sticky bottom-0 bg-white">
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="text-gray-500" onClick={handleFileUpload}>
                  <Paperclip className="h-5 w-5" />
                </Button>
                <Input
                  placeholder="Write a message"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="flex-1 bg-gray-100 border-none focus-visible:ring-1 focus-visible:ring-primaryGreen focus-visible:ring-offset-0"
                />
                <Button variant="ghost" size="icon" className="text-primaryGreen" onClick={handleSendMessage}>
                  <Send className="h-5 w-5" />
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={handleSendMessage}
                  accept={ALLOWED_FILE_TYPES.join(',')}
                />
              </div>
            </div>
          </div>
        ) : (
          // Empty State
          <div className="flex flex-col items-center justify-center p-4">
            <div className="rounded-full bg-lighterGreen p-6 mb-4">
              <MessageCircle className="h-12 w-12 text-primaryGreen" />
            </div>
            <h2 className="text-2xl font-semibold font-bricolage text-absoluteDark mb-2">Your Majestic Escape Chats</h2>
            <p className="text-gray-500 mb-4">Connect with your host </p>
            </div>
        )}
      </div>
    </div>
  )
}
