import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Send, Plus } from 'lucide-react';
import { toast } from 'sonner';
import { supportApi } from '@/services/api/supportApi';
import type { SupportTicket } from '@/services/api/supportApi';

const Support = () => {
  const [newTicket, setNewTicket] = useState({
    subject: '',
    message: '',
    priority: 'medium' as const,
    category: ''
  });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const queryClient = useQueryClient();

  // Fetch user tickets using the correct method name
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['user-support-tickets'],
    queryFn: supportApi.getUserTickets
  });

  // Create ticket mutation using the correct method name
  const createTicketMutation = useMutation({
    mutationFn: supportApi.createTicket,
    onSuccess: () => {
      toast.success('تم إنشاء التذكرة بنجاح');
      setNewTicket({ subject: '', message: '', priority: 'medium', category: '' });
      queryClient.invalidateQueries({ queryKey: ['user-support-tickets'] });
    },
    onError: () => {
      toast.error('فشل في إنشاء التذكرة');
    }
  });

  // Reply to ticket mutation using the correct method name
  const replyMutation = useMutation({
    mutationFn: (data: { ticketId: string; message: string }) =>
      supportApi.replyToTicket(data.ticketId, data.message),
    onSuccess: () => {
      toast.success('تم إرسال الرد بنجاح');
      setReplyMessage('');
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', selectedTicket?.id] });
    },
    onError: () => {
      toast.error('فشل في إرسال الرد');
    }
  });

  const handleCreateTicket = () => {
    if (!newTicket.subject.trim() || !newTicket.message.trim()) {
      toast.error('يرجى ملء جميع الحقول المطلوبة');
      return;
    }

    createTicketMutation.mutate(newTicket);
  };

  const handleSendReply = () => {
    if (!selectedTicket || !replyMessage.trim()) {
      toast.error('يرجى كتابة رد قبل الإرسال');
      return;
    }

    replyMutation.mutate({
      ticketId: selectedTicket.id,
      message: replyMessage
    });
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'pending': return 'destructive';
      case 'in_progress': return 'default';
      case 'resolved': return 'secondary';
      case 'closed': return 'outline';
      default: return 'default';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'في الانتظار';
      case 'in_progress': return 'قيد المعالجة';
      case 'resolved': return 'تم الحل';
      case 'closed': return 'مغلق';
      default: return status;
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">الدعم الفني</h1>
        <p className="text-gray-600">تواصل معنا للحصول على المساعدة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create New Ticket */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إنشاء تذكرة جديدة
            </CardTitle>
            <CardDescription>أنشئ تذكرة دعم فني جديدة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">الموضوع</label>
              <Input
                placeholder="اكتب موضوع التذكرة"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">الأولوية</label>
              <Select 
                value={newTicket.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setNewTicket({ ...newTicket, priority: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">منخفض</SelectItem>
                  <SelectItem value="medium">متوسط</SelectItem>
                  <SelectItem value="high">عالي</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">الفئة</label>
              <Input
                placeholder="فئة المشكلة (اختياري)"
                value={newTicket.category}
                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">الرسالة</label>
              <Textarea
                placeholder="اشرح مشكلتك بالتفصيل"
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                rows={4}
              />
            </div>

            <Button 
              onClick={handleCreateTicket}
              disabled={createTicketMutation.isPending}
              className="w-full"
            >
              {createTicketMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء التذكرة'}
            </Button>
          </CardContent>
        </Card>

        {/* Existing Tickets */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              تذاكر الدعم الخاصة بك
            </CardTitle>
            <CardDescription>عرض وإدارة تذاكر الدعم الفني</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-4">جاري التحميل...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-4 text-gray-500">لا توجد تذاكر دعم فني</div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                      selectedTicket?.id === ticket.id ? 'bg-blue-50 border-blue-200' : ''
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm">{ticket.subject}</h3>
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Selected Ticket Details */}
      {selectedTicket && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>تفاصيل التذكرة</CardTitle>
            <CardDescription>{selectedTicket.subject}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm">{selectedTicket.message}</p>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="اكتب ردك هنا..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleSendReply}
                  disabled={replyMutation.isPending || !replyMessage.trim()}
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Support;
