
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
    priority: 'medium' as 'low' | 'medium' | 'high',
    category: ''
  });
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const queryClient = useQueryClient();

  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['user-support-tickets'],
    queryFn: supportApi.getUserTickets
  });

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
    <div className="container mx-auto p-6 bg-gradient-to-br from-rajhi-primary via-rajhi-primary/10 to-white min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 text-rajhi-primary">الدعم الفني</h1>
        <p className="text-rajhi-secondary">تواصل معنا للحصول على المساعدة</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-rajhi-accent shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-rajhi-primary to-rajhi-accent text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              إنشاء تذكرة جديدة
            </CardTitle>
            <CardDescription className="text-rajhi-light">أنشئ تذكرة دعم فني جديدة</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 p-6">
            <div>
              <label className="text-sm font-medium mb-2 block text-rajhi-primary">الموضوع</label>
              <Input
                placeholder="اكتب موضوع التذكرة"
                value={newTicket.subject}
                onChange={(e) => setNewTicket({ ...newTicket, subject: e.target.value })}
                className="border-rajhi-accent focus:border-rajhi-primary"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block text-rajhi-primary">الأولوية</label>
              <Select 
                value={newTicket.priority} 
                onValueChange={(value: 'low' | 'medium' | 'high') => 
                  setNewTicket({ ...newTicket, priority: value })
                }
              >
                <SelectTrigger className="border-rajhi-accent focus:border-rajhi-primary">
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
              <label className="text-sm font-medium mb-2 block text-rajhi-primary">الفئة</label>
              <Input
                placeholder="فئة المشكلة (اختياري)"
                value={newTicket.category}
                onChange={(e) => setNewTicket({ ...newTicket, category: e.target.value })}
                className="border-rajhi-accent focus:border-rajhi-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-rajhi-primary">الرسالة</label>
              <Textarea
                placeholder="اشرح مشكلتك بالتفصيل"
                value={newTicket.message}
                onChange={(e) => setNewTicket({ ...newTicket, message: e.target.value })}
                rows={4}
                className="border-rajhi-accent focus:border-rajhi-primary"
              />
            </div>

            <Button 
              onClick={handleCreateTicket}
              disabled={createTicketMutation.isPending}
              className="w-full bg-gradient-to-r from-rajhi-primary to-rajhi-accent hover:from-rajhi-accent hover:to-rajhi-primary text-white"
            >
              {createTicketMutation.isPending ? 'جاري الإنشاء...' : 'إنشاء التذكرة'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-rajhi-accent shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-rajhi-primary to-rajhi-accent text-white rounded-t-lg">
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              تذاكر الدعم الخاصة بك
            </CardTitle>
            <CardDescription className="text-rajhi-light">عرض وإدارة تذاكر الدعم الفني</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {isLoading ? (
              <div className="text-center py-4">جاري التحميل...</div>
            ) : tickets.length === 0 ? (
              <div className="text-center py-4 text-rajhi-secondary">لا توجد تذاكر دعم فني</div>
            ) : (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className={`p-3 border rounded-lg cursor-pointer hover:bg-rajhi-light/10 transition-colors ${
                      selectedTicket?.id === ticket.id ? 'bg-rajhi-primary/10 border-rajhi-primary' : 'border-rajhi-accent'
                    }`}
                    onClick={() => setSelectedTicket(ticket)}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-medium text-sm text-rajhi-primary">{ticket.subject}</h3>
                      <Badge variant={getStatusBadgeVariant(ticket.status)}>
                        {getStatusText(ticket.status)}
                      </Badge>
                    </div>
                    <p className="text-xs text-rajhi-secondary">
                      {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {selectedTicket && (
        <Card className="mt-6 border-rajhi-accent shadow-xl bg-white/90 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-rajhi-primary to-rajhi-accent text-white rounded-t-lg">
            <CardTitle>تفاصيل التذكرة</CardTitle>
            <CardDescription className="text-rajhi-light">{selectedTicket.subject}</CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-4">
              <div className="p-3 bg-rajhi-light/5 rounded-lg border border-rajhi-accent">
                <p className="text-sm text-rajhi-primary">{selectedTicket.message}</p>
              </div>
              
              <div className="flex gap-2">
                <Input
                  placeholder="اكتب ردك هنا..."
                  value={replyMessage}
                  onChange={(e) => setReplyMessage(e.target.value)}
                  className="flex-1 border-rajhi-accent focus:border-rajhi-primary"
                />
                <Button 
                  onClick={handleSendReply}
                  disabled={replyMutation.isPending || !replyMessage.trim()}
                  className="bg-gradient-to-r from-rajhi-primary to-rajhi-accent hover:from-rajhi-accent hover:to-rajhi-primary text-white"
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
