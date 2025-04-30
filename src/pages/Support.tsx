
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api, SupportTicket } from '@/services/api';
import { MessageSquare, Send } from 'lucide-react';
import { toast } from 'sonner';

const Support = () => {
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [tickets, setTickets] = useState<SupportTicket[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !message) {
      toast.error('الرجاء إدخال الموضوع والرسالة');
      return;
    }
    
    setIsLoading(true);
    try {
      const newTicket = await api.createSupportTicket(subject, message);
      setTickets([newTicket, ...tickets]);
      setSubject('');
      setMessage('');
      toast.success('تم إرسال رسالتك بنجاح. سيتم الرد عليك قريبًا.');
    } catch (error) {
      console.error('Failed to create support ticket', error);
      toast.error('حدث خطأ أثناء إرسال الرسالة. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
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
              disabled={isLoading}
            >
              {isLoading ? (
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
      
      {tickets.length > 0 && (
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
                  
                  {ticket.responses.length > 0 ? (
                    <div className="border-t pt-4 mt-4 space-y-4">
                      {ticket.responses.map(response => (
                        <div 
                          key={response.id} 
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
      )}
    </div>
  );
};

export default Support;
