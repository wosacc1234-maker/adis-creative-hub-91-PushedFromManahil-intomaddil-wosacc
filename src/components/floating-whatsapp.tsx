import { MessageCircle, X, Send } from "lucide-react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface Message {
  id: number
  text: string
  isOwner: boolean
  timestamp: Date
}

export function FloatingWhatsApp() {
  const [isOpen, setIsOpen] = useState(false)
  const [isOnline, setIsOnline] = useState(true) // Set this based on your availability
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "👋 Hi! I'm Adil. How can I help you with your design project today?",
      isOwner: true,
      timestamp: new Date()
    }
  ])
  const [inputValue, setInputValue] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const whatsappNumber = "+1234567890" // Replace with actual WhatsApp number
  const defaultMessage = "Hi Adil! I'm interested in your design services. Can we discuss my project?"

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isOpen && isOnline && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen, isOnline])

  const openWhatsApp = () => {
    const url = `https://wa.me/${whatsappNumber.replace('+', '')}?text=${encodeURIComponent(defaultMessage)}`
    window.open(url, '_blank')
  }

  const handleSendMessage = () => {
    if (!inputValue.trim()) return

    const newMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isOwner: false,
      timestamp: new Date()
    }
    
    setMessages(prev => [...prev, newMessage])
    setInputValue("")

    // Simulate owner response (replace with real-time chat logic)
    setTimeout(() => {
      const response: Message = {
        id: Date.now() + 1,
        text: "Thanks for your message! I'll respond shortly.",
        isOwner: true,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, response])
    }, 1500)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Interface */}
      {isOpen && isOnline && (
        <div className="fixed bottom-24 right-6 w-80 h-96 bg-card border border-border rounded-xl shadow-glow z-50 flex flex-col animate-fade-in">
          {/* Header */}
          <div className="bg-[#25D366] text-white p-4 rounded-t-xl flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <span className="font-bold text-sm">A</span>
              </div>
              <div>
                <div className="font-semibold text-sm">Adil GFX</div>
                <div className="text-xs opacity-90">● Online - Live Chat</div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(false)}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.isOwner ? 'justify-start' : 'justify-end'}`}>
                <div className={`max-w-xs rounded-lg p-3 ${
                  message.isOwner 
                    ? 'bg-muted text-foreground' 
                    : 'bg-[#25D366] text-white'
                }`}>
                  <p className="text-sm">{message.text}</p>
                  <p className={`text-xs mt-1 ${message.isOwner ? 'text-muted-foreground' : 'text-white/70'}`}>
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-border">
            <div className="flex space-x-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message..."
                className="flex-1 text-sm"
              />
              <Button
                onClick={handleSendMessage}
                size="sm"
                className="bg-[#25D366] hover:bg-[#20BC5A] text-white"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Offline WhatsApp Prompt */}
      {isOpen && !isOnline && (
        <div className="fixed bottom-24 right-6 w-80 bg-card border border-border rounded-xl shadow-glow z-50 animate-fade-in">
          <div className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                <div className="w-10 h-10 bg-gradient-youtube rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-sm">A</span>
                </div>
                <div>
                  <div className="font-semibold text-foreground text-sm">Adil GFX</div>
                  <div className="text-xs text-muted-foreground">● Offline</div>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="bg-muted rounded-lg p-3 mb-3">
              <p className="text-sm text-foreground">
                👋 I'm currently offline, but you can reach me on WhatsApp!
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                I typically respond within a few hours.
              </p>
            </div>
            
            <Button
              onClick={openWhatsApp}
              className="w-full bg-[#25D366] hover:bg-[#20BC5A] text-white font-medium text-sm"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Chat on WhatsApp
            </Button>
          </div>
        </div>
      )}
      
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-[#25D366] hover:bg-[#20BC5A] text-white shadow-glow transition-all duration-300 hover:scale-110"
        >
          {isOpen ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
        </Button>
        
        {!isOpen && (
          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${isOnline ? 'bg-green-500' : 'bg-muted'} animate-pulse`} />
        )}
      </div>
    </>
  )
}