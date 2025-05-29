
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MessageSquare, User, Clock, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { supportApi, SupportTicket, TicketMessage } from '@/services/api/supportApi';

const AdminSupport = () => {
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [replyMessage, setReplyMessage] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const queryClient = useQueryClient();

  // Fetch all support tickets
  const { data: tickets = [], isLoading } = useQuery({
    queryKey: ['admin-support-tickets'],
    queryFn: supportApi.getAllSupportTickets
  });

  // Fetch messages for selected ticket
  const { data: messages = [] } = useQuery({
    queryKey: ['ticket-messages', selectedTicket?.id],
    queryFn: () => selectedTicket ? supportApi.getTicketMessages(selectedTicket.id) : Promise.resolve([]),
    enabled: !!selectedTicket
  });

  // Reply to ticket mutation
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

  // Update ticket status mutation
  const updateStatusMutation = useMutation({
    mutationFn: (data: { ticketId: string; status: string }) =>
      supportApi.updateTicketStatus(data.ticketId, data.status),
    onSuccess: () => {
      toast.success('تم تحديث حالة التذكرة بنجاح');
      queryClient.invalidateQueries({ queryKey: ['admin-support-tickets'] });
      queryClient.invalidateQueries({ queryKey: ['ticket-messages', selectedTicket?.id] });
    },
    onError: () => {
      toast.error('فشل في تحديث حالة التذكرة');
    }
  });

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

  const handleStatusUpdate = (status: string) => {
    if (!selectedTicket) return;

    updateStatusMutation.mutate({
      ticketId: selectedTicket.id,
      status
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

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'low': return 'منخفض';
      case 'medium': return 'متوسط';
      case 'high': return 'عالي';
      default: return priority;
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    statusFilter === 'all' || ticket.status === statusFilter
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">إدارة الدعم الفني</h1>
        <p className="text-gray-600">إدارة تذاكر الدعم الفني والرد على العملاء</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tickets List */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  التذاكر
                </CardTitle>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">الكل</SelectItem>
                    <SelectItem value="pending">في الانتظار</SelectItem>
                    <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                    <SelectItem value="resolved">تم الحل</SelectItem>
                    <SelectItem value="closed">مغلق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <CardDescription>قائمة بجميع تذاكر الدعم الفني</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {isLoading ? (
                <div className="p-4 text-center">جاري التحميل...</div>
              ) : filteredTickets.length === 0 ? (
                <div className="p-4 text-center text-gray-500">لا توجد تذاكر</div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  {filteredTickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                        selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => setSelectedTicket(ticket)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-medium text-sm truncate">{ticket.subject}</h3>
                        <Badge variant={getStatusBadgeVariant(ticket.status)} className="text-xs">
                          {getStatusText(ticket.status)}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <User className="h-3 w-3" />
                        <span>{ticket.userName}</span>
                        <span>•</span>
                        <span>ID: {ticket.userId}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <Clock className="h-3 w-3" />
                        <span>{new Date(ticket.createdAt).toLocaleDateString('ar-SA')}</span>
                        <span>•</span>
                        <span>{getPriorityText(ticket.priority)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Ticket Details and Chat */}
        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>{selectedTicket.subject}</CardTitle>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <User className="h-4 w-4" />
                        <span>{selectedTicket.userName} (ID: {selectedTicket.userId})</span>
                      </div>
                      <Badge variant={getStatusBadgeVariant(selectedTicket.status)}>
                        {getStatusText(selectedTicket.status)}
                      </Badge>
                    </div>
                  </div>
                  <Select 
                    value={selectedTicket.status} 
                    onValueChange={handleStatusUpdate}
                    disabled={updateStatusMutation.isPending}
                  >
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">في الانتظار</SelectItem>
                      <SelectItem value="in_progress">قيد المعالجة</SelectItem>
                      <SelectItem value="resolved">تم الحل</SelectItem>
                      <SelectItem value="closed">مغلق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardHeader>
              <CardContent>
                {/* Messages */}
                <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                  {messages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.isAdmin ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                          message.isAdmin
                            ? 'bg-blue-500 text-white'
                            : 'bg-gray-200 text-gray-800'
                        }`}
                      >
                        <div className="text-sm">{message.message}</div>
                        <div className={`text-xs mt-1 ${
                          message.isAdmin ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {message.userName} • {new Date(message.createdAt).toLocaleString('ar-SA')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Reply Input */}
                <div className="space-y-4">
                  <Textarea
                    placeholder="اكتب ردك هنا..."
                    value={replyMessage}
                    onChange={(e) => setReplyMessage(e.target.value)}
                    rows={3}
                  />
                  <Button 
                    onClick={handleSendReply}
                    disabled={replyMutation.isPending || !replyMessage.trim()}
                    className="w-full"
                  >
                    {replyMutation.isPending ? 'جاري الإرسال...' : 'إرسال الرد'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center h-64">
                <div className="text-center text-gray-500">
                  <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p>اختر تذكرة لعرض التفاصيل والمحادثة</p>
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
