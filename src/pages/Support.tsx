
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { api } from '@/services/api';
import { SupportTicket } from '@/types/SupportTicket';
import { MessageSquare, Send } from 'lucide-react';

const Support = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [replyMessages, setReplyMessages] = useState<Record<string, string>>({});
  const [replying, setReplying] = useState<Record<string, boolean>>({});

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setLoading(true);
    try {
      const data = await api.getUserSupportTickets();
      setTickets(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch tickets:', error);
      toast.error('فشل في جلب التذاكر');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject.trim() || !message.trim()) {
      toast.error('يرجى ملء جميع الحقول');
      return;
    }
    
    setSubmitting(true);
    try {
      await api.createSupportTicket({ 
        subject: subject.trim(),
        message: message.trim() 
      });
      
      toast.success('تم إرسال التذكرة بنجاح');
      setSubject('');
      setMessage('');
      fetchTickets();
    } catch (error) {
      console.error('Failed to submit ticket:', error);
      toast.error('فشل في إرسال التذكرة');
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleReplyChange = (ticketId: string, value: string) => {
    setReplyMessages(prev => ({ ...prev, [ticketId]: value }));
  };
  
  const handleReplySubmit = async (ticketId: string) => {
    if (!replyMessages[ticketId]?.trim()) {
      toast.error('يرجى كتابة رد أولاً');
      return;
    }
    
    setReplying(prev => ({ ...prev, [ticketId]: true }));
    
    try {
      await api.replySupportTicket(ticketId, replyMessages[ticketId]);
      toast.success('تم إرسال الرد بنجاح');
      setReplyMessages(prev => ({ ...prev, [ticketId]: '' }));
      fetchTickets(); // إعادة تحميل التذاكر بعد إرسال الرد
    } catch (error) {
      console.error('Failed to send reply:', error);
      toast.error('فشل في إرسال الرد');
    } finally {
      setReplying(prev => ({ ...prev, [ticketId]: false }));
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>التواصل مع الدعم الفني</CardTitle>
          <CardDescription>إذا كان لديك أي استفسار أو مشكلة، يرجى إرسال رسالة إلينا وسنقوم بالرد عليك في أقرب وقت ممكن</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="subject">الموضوع</Label>
              <Input
                id="subject"
                placeholder="موضوع الرسالة"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">الرسالة</Label>
              <Textarea
                id="message"
                placeholder="اكتب رسالتك هنا..."
                rows={6}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
              />
            </div>
            
            <Button 
              type="submit" 
              className="gradient-bg"
              disabled={submitting}
            >
              {submitting ? (
                <>جاري الإرسال...</>
              ) : (
                <>
                  <Send className="ml-2 h-4 w-4" />
                  إرسال الرسالة
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
      
      {loading ? (
        <div className="flex justify-center items-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-brand-500"></div>
        </div>
      ) : tickets.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>رسائلي السابقة</CardTitle>
            <CardDescription>تواصلك السابق مع فريق الدعم الفني</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {tickets.map(ticket => (
                <div key={ticket.id} className="border rounded-lg p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{ticket.subject}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ticket.status === 'open' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ticket.status === 'open' ? 'مفتوح' : 'مغلق'}
                    </span>
                  </div>
                  <p className="text-gray-600 mb-4">{ticket.message}</p>
                  
                  {ticket.responses && ticket.responses.length > 0 ? (
                    <div className="border-t pt-4 mt-4 space-y-4">
                      {ticket.responses.map((response, idx) => (
                        <div 
                          key={response.id || idx} 
                          className={`p-3 rounded-lg ${
                            response.fromAdmin 
                              ? 'bg-brand-50 mr-8' 
                              : 'bg-gray-50 ml-8'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                              response.fromAdmin ? 'bg-brand-200' : 'bg-gray-200'
                            }`}>
                              <MessageSquare className="h-3 w-3" />
                            </div>
                            <span className="text-sm font-medium">
                              {response.fromAdmin ? 'فريق الدعم' : 'أنت'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                          <p>{response.message}</p>
                        </div>
                      ))}

                      {/* نموذج الرد على التذكرة - يظهر فقط إذا كانت التذكرة مفتوحة */}
                      {ticket.status === 'open' && (
                        <div className="mt-4 border-t pt-4">
                          <div className="space-y-2">
                            <Label htmlFor={`reply-${ticket.id}`}>الرد على الرسالة</Label>
                            <Textarea
                              id={`reply-${ticket.id}`}
                              placeholder="اكتب ردك هنا..."
                              rows={3}
                              value={replyMessages[ticket.id] || ''}
                              onChange={(e) => handleReplyChange(ticket.id, e.target.value)}
                            />
                            <Button
                              onClick={() => handleReplySubmit(ticket.id)}
                              disabled={replying[ticket.id] || !replyMessages[ticket.id]?.trim()}
                              size="sm"
                              className="gradient-bg"
                            >
                              {replying[ticket.id] ? 'جاري الإرسال...' : (
                                <>
                                  <Send className="ml-2 h-4 w-4" />
                                  إرسال الرد
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 mt-2">
                      لم يتم الرد بعد. سيتم الرد عليك قريبًا.
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-gray-500">لا توجد رسائل سابقة</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Support;
