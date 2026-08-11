import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Send, Paperclip, CheckCheck, Check, Loader2, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/lib/supabase';
import { Message } from '@/types';
import { toast } from 'sonner';

const MessagingPage = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [content, setContent] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [bookingInfo, setBookingInfo] = useState<{ providerName: string; petName: string; status: string } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!user || !bookingId) return;
    fetchMessages();
    fetchBookingInfo();

    const channel = supabase
      .channel(`messages_${bookingId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'messages',
        filter: `booking_id=eq.${bookingId}`,
      }, (payload) => {
        const row = payload.new as Record<string, unknown>;
        const newMsg: Message = {
          id: row.id as string,
          bookingId: row.booking_id as string,
          senderId: row.sender_id as string,
          content: row.content as string,
          attachmentUrl: row.attachment_url as string | undefined,
          attachmentType: row.attachment_type as string | undefined,
          readBy: (row.read_by as string[]) || [],
          createdAt: row.created_at as string,
        };
        setMessages(prev => [...prev, newMsg]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, bookingId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchBookingInfo = async () => {
    if (!bookingId) return;
    const { data } = await supabase
      .from('bookings')
      .select('status, providers(business_name), pets(name)')
      .eq('id', bookingId)
      .single();
    if (data) {
      const provider = data.providers as Record<string, unknown> | null;
      const pet = data.pets as Record<string, unknown> | null;
      setBookingInfo({
        providerName: provider ? (provider.business_name as string) : 'Provider',
        petName: pet ? (pet.name as string) : 'Pet',
        status: data.status as string,
      });
    }
  };

  const fetchMessages = async () => {
    if (!bookingId) return;
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('booking_id', bookingId)
      .order('created_at', { ascending: true });
    if (!error && data) {
      setMessages(data.map((m: Record<string, unknown>) => ({
        id: m.id as string,
        bookingId: m.booking_id as string,
        senderId: m.sender_id as string,
        content: m.content as string,
        attachmentUrl: m.attachment_url as string | undefined,
        attachmentType: m.attachment_type as string | undefined,
        readBy: (m.read_by as string[]) || [],
        createdAt: m.created_at as string,
      })));
    }
    setLoading(false);
  };

  const sendMessage = async () => {
    if (!content.trim() || !user || !bookingId) return;
    setSending(true);
    const { error } = await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: user.id,
      content: content.trim(),
    });
    if (error) {
      toast.error('Failed to send message');
    } else {
      setContent('');
    }
    setSending(false);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user || !bookingId) return;

    const ext = file.name.split('.').pop();
    const path = `messages/${bookingId}/${Date.now()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from('chat-attachments').upload(path, file);
    if (uploadError) {
      toast.error('Upload failed');
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('chat-attachments').getPublicUrl(path);
    const isImage = file.type.startsWith('image/');
    await supabase.from('messages').insert({
      booking_id: bookingId,
      sender_id: user.id,
      content: isImage ? '📷 Sent a photo' : `📎 ${file.name}`,
      attachment_url: publicUrl,
      attachment_type: isImage ? 'image' : 'file',
    });
    toast.success('File shared successfully');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString('en-AU', { hour: '2-digit', minute: '2-digit' });

  const isOwn = (msg: Message) => msg.senderId === user?.id;
  const isRead = (msg: Message) => user && msg.readBy.includes(user.id) && isOwn(msg);

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <div className="max-w-3xl mx-auto w-full px-4 pt-20 pb-0 flex flex-col flex-1" style={{ height: 'calc(100vh - 64px)' }}>
        {/* Header */}
        <div className="flex items-center gap-3 py-4 border-b border-border">
          <button onClick={() => navigate(-1)} className="p-2 rounded-lg hover:bg-muted transition-colors">
            <ArrowLeft className="w-4 h-4 text-muted-foreground" />
          </button>
          {bookingInfo ? (
            <div>
              <h1 className="font-bold text-foreground">{bookingInfo.providerName}</h1>
              <p className="text-xs text-muted-foreground">{bookingInfo.petName} · <span className="capitalize">{bookingInfo.status}</span></p>
            </div>
          ) : (
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
          )}
          <div className="ml-auto flex items-center gap-1.5 text-xs text-emerald-600 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Live
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4 space-y-3 min-h-0">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="text-4xl mb-3">💬</p>
              <p className="font-semibold">No messages yet</p>
              <p className="text-sm">Start the conversation with your service provider.</p>
            </div>
          ) : (
            messages.map(msg => (
              <div key={msg.id} className={`flex ${isOwn(msg) ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${isOwn(msg) ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                  <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                    isOwn(msg)
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white border border-border text-foreground rounded-bl-sm'
                  }`}>
                    {msg.attachmentType === 'image' && msg.attachmentUrl ? (
                      <img src={msg.attachmentUrl} alt="attachment" className="rounded-xl max-w-full mb-1 max-h-48 object-cover" />
                    ) : null}
                    {msg.content}
                  </div>
                  <div className={`flex items-center gap-1 text-xs text-muted-foreground ${isOwn(msg) ? 'flex-row-reverse' : ''}`}>
                    <span>{formatTime(msg.createdAt)}</span>
                    {isOwn(msg) && (
                      isRead(msg)
                        ? <CheckCheck className="w-3.5 h-3.5 text-primary" />
                        : <Check className="w-3.5 h-3.5" />
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border py-3 flex items-center gap-2">
          <input ref={fileRef} type="file" className="hidden" accept="image/*,.pdf,.doc,.docx" onChange={handleFileUpload} />
          <button
            onClick={() => fileRef.current?.click()}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <Paperclip className="w-5 h-5" />
          </button>
          <button
            onClick={() => { if (fileRef.current) { fileRef.current.accept = 'image/*'; fileRef.current.click(); } }}
            className="p-2.5 rounded-xl text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <Input
            value={content}
            onChange={e => setContent(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-xl border-border h-11"
          />
          <Button
            onClick={sendMessage}
            disabled={!content.trim() || sending}
            className="h-11 w-11 p-0 rounded-xl bg-primary hover:bg-primary/90 shrink-0"
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MessagingPage;
