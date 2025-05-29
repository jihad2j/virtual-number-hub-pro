
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, User, Clock, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { api } from '@/services/api';
import { SupportTicket } from '@/types/SupportTicket';

interface TicketMessage {
  id: string;
  message: string;
  isAdmin: boolean;
  createdAt: string;
  senderName: string;
}

interface TicketWithUser extends SupportTicket {
  userName?: string;
  userEmail?: string;
}

const AdminSupport = () => {
  const [selectedTicket, setSelectedTicket] = useState<TicketWithUser | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [messages, setMessages] = useState<TicketMessage[]>([]);
  const queryClient = useQueryClient();

  // جلب جميع التذاكر
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: async (): Promise<TicketWithUser[]> => {
      const response = await api.getSupportTickets();
      
      // جلب بيانات المستخدمين للتذاكر
      const ticketsWithUsers = await Promise.all(
        response.map(async (ticket) => {
          if (ticket.userId) {
            try {
              const userResponse = await api.getUser(ticket.userId);
              return {
                ...ticket,
                userName: userResponse.username,
                userEmail: userResponse.email
              };
            } catch (error) {
              console.error('Failed to fetch user data:', error);
              return {
                ...ticket,
                userName: 'مستخدم غير معروف',
                userEmail: 'غير متوفر'
              };
            }
          }
          return {
            ...ticket,
            userName: 'ضيف',
            userEmail: 'غير متوفر'
          };
        })
      );
      
      return ticketsWithUsers;
    }
  });

  // جلب رسائل التذكرة
  const fetchTicketMessages = async (ticketId: string) => {
    try {
      const response = await api.getTicketMessages(ticketId);
      setMessages(response);
    } catch (error) {
      console.error('Failed to fetch messages:', error);
      toast.error('فشل في جلب الرسائل');
    }
  };

  // إرسال رد
  const replyMutation = useMutation({
    mutationFn: async (data: { ticketId: string; message: string }) => {
      return await api.replyToTicket(data.ticketId, data.message);
    },
    onSuccess: () => {
      toast.success('تم إرسال الرد بنجاح');
      setReplyMessage('');
      if (selectedTicket) {
        fetchTicketMessages(selectedTicket.id);
      }
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
    onError: () => {
      toast.error('فشل في إرسال الرد');
    }
  });

  // إغلاق التذكرة
  const closeMutation = useMutation({
    mutationFn: async (ticketId: string) => {
      return await api.updateTicketStatus(ticketId, 'closed');
    },
    onSuccess: () => {
      toast.success('تم إغلاق التذكرة بنجاح');
      setSelectedTicket(null);
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
    },
    onError: () => {
      toast.error('فشل في إغلاق التذكرة');
    }
  });

  const handleTicketSelect = (ticket: TicketWithUser) => {
    setSelectedTicket(ticket);
    fetchTicketMessages(ticket.id);
  };

  const handleReply = () => {
    if (!selectedTicket || !replyMessage.trim()) return;
    
    replyMutation.mutate({
      ticketId: selectedTicket.id,
      message: replyMessage
    });
  };

  const handleCloseTicket = () => {
    if (!selectedTicket) return;
    closeMutation.mutate(selectedTicket.id);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800';
      case 'in_progress': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-gray-100 text-gray-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'open': return 'مفتوحة';
      case 'in_progress': return 'قيد المعالجة';
      case 'closed': return 'مغلقة';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة الدعم الفني</h1>
        <p className="text-gray-600">إدارة والرد على استفسارات العملاء</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* قائمة التذاكر */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                التذاكر ({tickets.length})
              </CardTitle>
              <CardDescription>جميع تذاكر الدعم الفني</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-brand-500 mx-auto"></div>
                </div>
              ) : tickets.length === 0 ? (
                <p className="text-center text-gray-500 py-4">لا توجد تذاكر</p>
              ) : (
                <div className="space-y-3">
                  {tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        selectedTicket?.id === ticket.id
                          ? 'border-brand-500 bg-brand-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => handleTicketSelect(ticket)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="font-medium text-sm">{ticket.subject}</h4>
                        <Badge className={`text-xs ${getStatusColor(ticket.status)}`}>
                          {getStatusText(ticket.status)}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 space-y-1">
                        <div className="flex items-center gap-1">
                          <User className="h-3 w-3" />
                          {ticket.userName} (ID: {ticket.userId || 'N/A'})
                        </div>
                        <div>{ticket.userEmail}</div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(ticket.createdAt).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* تفاصيل التذكرة والرسائل */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card className="h-full">
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <CardDescription>
                      العميل: {selectedTicket.userName} - {selectedTicket.userEmail}
                      <br />
                      ID المستخدم: {selectedTicket.userId || 'غير متوفر'}
                    </CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Badge className={getStatusColor(selectedTicket.status)}>
                      {getStatusText(selectedTicket.status)}
                    </Badge>
                    {selectedTicket.status !== 'closed' && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleCloseTicket}
                        disabled={closeMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-1" />
                        إغلاق التذكرة
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col h-96">
                {/* الرسائل */}
                <ScrollArea className="flex-1 mb-4">
                  <div className="space-y-4">
                    {/* الرسالة الأولى */}
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{selectedTicket.userName}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(selectedTicket.createdAt).toLocaleString('ar-EG')}
                        </span>
                      </div>
                      <p className="text-sm">{selectedTicket.message}</p>
                    </div>

                    {/* الرسائل الإضافية */}
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`p-3 rounded-lg ${
                          message.isAdmin
                            ? 'bg-brand-50 ml-8'
                            : 'bg-gray-50 mr-8'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-medium">
                            {message.isAdmin ? 'الإدارة' : message.senderName}
                          </span>
                          <span className="text-xs text-gray-500">
                            {new Date(message.createdAt).toLocaleString('ar-EG')}
                          </span>
                        </div>
                        <p className="text-sm">{message.message}</p>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                {/* نموذج الرد */}
                {selectedTicket.status !== 'closed' && (
                  <div className="border-t pt-4">
                    <div className="space-y-3">
                      <Label htmlFor="reply">الرد على العميل</Label>
                      <Textarea
                        id="reply"
                        value={replyMessage}
                        onChange={(e) => setReplyMessage(e.target.value)}
                        placeholder="اكتب ردك هنا..."
                        rows={3}
                      />
                      <Button
                        onClick={handleReply}
                        disabled={!replyMessage.trim() || replyMutation.isPending}
                        className="w-full"
                      >
                        <Send className="h-4 w-4 mr-2" />
                        {replyMutation.isPending ? 'جاري الإرسال...' : 'إرسال الرد'}
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card className="h-full flex items-center justify-center">
              <CardContent>
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4" />
                  <p>اختر تذكرة لعرض التفاصيل والرد عليها</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
