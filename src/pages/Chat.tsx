import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "motion/react";
import { 
  Send, Image as ImageIcon, MapPin, 
  ChevronLeft, ChevronRight, MessageSquare, Info, 
  Zap, ArrowRight 
} from "lucide-react";
import { 
  db, collection, addDoc, onSnapshot, query, 
  where, orderBy, doc, serverTimestamp, getDoc,
  handleFirestoreError, OperationType
} from "../lib/firebase";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ChatPage({ user }: { user: any }) {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const [chats, setChats] = useState<any[]>([]);
  const [activeChat, setActiveChat] = useState<any>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;

    // Load available chats
    const q = query(
      collection(db, "chats"),
      where("participants", "array-contains", user.uid),
      orderBy("updatedAt", "desc")
    );

    return onSnapshot(q, async (snap) => {
      const chatList = await Promise.all(snap.docs.map(async (chatDoc) => {
        const data = chatDoc.data();
        // Fetch listing info
        const listingSnap = await getDoc(doc(db, "listings", data.listingId));
        // Fetch other participant info
        const otherId = data.participants.find((id: string) => id !== user.uid);
        const otherSnap = await getDoc(doc(db, "users", otherId));
        
        return {
          id: chatDoc.id,
          ...data,
          listing: listingSnap.data(),
          otherUser: otherSnap.data()
        };
      }));
      setChats(chatList);
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, "chats");
    });
  }, [user]);

  useEffect(() => {
    if (!chatId) return;

    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );

    const unsubMessages = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `chats/${chatId}/messages`);
    });

    const untubChat = onSnapshot(doc(db, "chats", chatId), async (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const otherId = data.participants.find((id: string) => id !== user.uid);
        const otherSnap = await getDoc(doc(db, "users", otherId));
        const listingSnap = await getDoc(doc(db, "listings", data.listingId));
        setActiveChat({ id: snap.id, ...data, otherUser: otherSnap.data(), listing: listingSnap.data() });
      }
    }, (err) => {
      handleFirestoreError(err, OperationType.GET, `chats/${chatId}`);
    });

    return () => {
      unsubMessages();
      untubChat();
    };
  }, [chatId, user]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !chatId) return;

    const content = newMessage;
    setNewMessage("");

    await addDoc(collection(db, "chats", chatId, "messages"), {
      senderId: user.uid,
      content,
      createdAt: serverTimestamp()
    });

    // Update last message in chat object
    // Note: We'd normally do this via a cloud function, but here we can try client-side if rules allow
  };

  return (
    <div className="h-[calc(100vh-80px)] max-w-7xl mx-auto px-8 py-8 flex gap-8">
      {/* Sidebar */}
      <div className="w-96 flex flex-col gap-6">
        <h2 className="text-3xl font-black uppercase italic tracking-tighter">MENSAGENS</h2>
        <div className="flex-1 overflow-y-auto pr-4 space-y-4 no-scrollbar">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => navigate(`/chat/${chat.id}`)}
              className={`w-full text-left p-6 glass-card premium-border rounded-3xl transition-all group ${
                chatId === chat.id ? 'bg-yellow-400/10 border-yellow-400' : 'hover:bg-white/5'
              }`}
            >
              <div className="flex gap-4">
                <img 
                  src={chat.listing?.images[0] || "https://images.unsplash.com/photo-1599819811279-d1921f3f7a6c?q=80&w=200&auto=format&fit=crop"} 
                  className="w-16 h-16 rounded-2xl object-cover shrink-0" 
                  alt="" 
                />
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                    <p className="text-[9px] font-black text-white/20 uppercase tracking-widest uppercase truncate">{chat.listing?.brand} {chat.listing?.model}</p>
                    <span className="text-[8px] font-black text-white/10">
                      {chat.updatedAt && typeof chat.updatedAt.toDate === 'function' ? formatDistanceToNow(chat.updatedAt.toDate(), { locale: ptBR }) : 'Recentemente'}
                    </span>
                  </div>
                  <h4 className="text-sm font-black uppercase tracking-tighter mb-2 italic truncate">{chat.otherUser?.displayName || "Interessado"}</h4>
                  <p className="text-[10px] items-center gap-2 text-white/30 truncate">
                    {chat.lastMessage || "Comece uma conversa..."}
                  </p>
                </div>
              </div>
            </button>
          ))}
          {chats.length === 0 && (
            <div className="py-20 text-center opacity-20 space-y-4">
              <MessageSquare className="w-12 h-12 mx-auto" />
              <p className="text-[10px] font-black uppercase tracking-widest">Nenhuma conversa ativa</p>
            </div>
          )}
        </div>
      </div>

      {/* Main Chat */}
      <div className="flex-1 glass-card premium-border rounded-[3rem] overflow-hidden flex flex-col bg-black/40">
        {activeChat ? (
          <>
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <img 
                    src={activeChat.otherUser?.photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=user"} 
                    className="w-14 h-14 rounded-2xl border border-white/10" 
                    alt="" 
                  />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-4 border-black" />
                </div>
                <div>
                  <h3 className="text-xl font-black uppercase italic tracking-tighter">{activeChat.otherUser?.displayName}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Zap className="w-3 h-3 text-yellow-500" />
                    <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest">Responde rápido</p>
                  </div>
                </div>
              </div>
              
              <Link to={`/listing/${activeChat.listingId}`} className="p-4 bg-white/5 rounded-2xl border border-white/10 hover:border-white/20 transition-all group group">
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-widest mb-0.5">Ref. Anúncio</p>
                    <p className="text-xs font-bold uppercase truncate max-w-[150px]">{activeChat.listing?.model}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-white/30 group-hover:text-yellow-500 transition-all" />
                </div>
              </Link>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-12 space-y-8 no-scrollbar scroll-smooth">
              {messages.map((msg, idx) => {
                const isMine = msg.senderId === user.uid;
                return (
                  <motion.div
                    initial={{ opacity: 0, x: isMine ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={msg.id}
                    className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] group ${isMine ? 'items-end' : 'items-start'}`}>
                      <div className={`p-6 rounded-[2rem] text-sm font-medium leading-relaxed ${
                        isMine 
                          ? 'bg-yellow-400 text-black rounded-tr-none' 
                          : 'bg-white/5 text-white/80 rounded-tl-none border border-white/5'
                      }`}>
                        {msg.content}
                      </div>
                      <p className={`text-[8px] font-black text-white/10 mt-3 uppercase tracking-widest ${isMine ? 'text-right' : 'text-left'}`}>
                        {msg.createdAt && typeof msg.createdAt.toDate === 'function' ? formatDistanceToNow(msg.createdAt.toDate(), { locale: ptBR }) : 'Agora'}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
              <div ref={scrollRef} />
            </div>

            {/* Input */}
            <div className="p-8 border-t border-white/5 bg-black/40">
              <form onSubmit={sendMessage} className="flex gap-4">
                <button type="button" className="w-14 h-14 rounded-2xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border-0 text-white/20 hover:text-white cursor-pointer">
                  <ImageIcon className="w-6 h-6" />
                </button>
                <div className="flex-1 relative">
                  <input 
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    className="w-full h-14 bg-white/5 border border-white/10 rounded-2xl px-8 pr-16 text-sm font-medium focus:border-yellow-400/50 outline-none transition-all placeholder:text-white/10"
                    placeholder="Escreva sua mensagem..."
                  />
                  <button 
                    type="submit"
                    className="absolute right-2 top-2 w-10 h-10 bg-yellow-400 rounded-xl flex items-center justify-center hover:bg-white transition-all border-0 text-black cursor-pointer"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-8">
            <div className="w-32 h-32 bg-white/5 rounded-full flex items-center justify-center border border-white/5">
              <MessageSquare className="w-12 h-12 text-white/5" />
            </div>
            <div className="space-y-4">
              <h2 className="text-4xl font-black uppercase italic tracking-tighter">Selecione uma conversa</h2>
              <p className="text-sm text-white/30 uppercase font-bold tracking-widest max-w-sm mx-auto leading-relaxed">
                Tire suas dúvidas diretamente com os vendedores e feche o melhor negócio da plataforma.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
