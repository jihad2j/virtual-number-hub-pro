
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { api, SupportTicket } from '@/services/api';
import { MessageSquare, Mail, User } from 'lucide-react';
import { toast } from 'sonner';
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";

const AdminSupport = () => {
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
  const [reply, setReply] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    setIsLoading(true);
    try {
      const data = await api.getAllSupportTickets();
      setTickets(data);
    } catch (error) {
      console.error('Failed to fetch support tickets', error);
      toast.error('فشل في جلب تذاكر الدعم');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendReply = async () => {
    if (!selectedTicket || !reply.trim()) {
      toast.error('الرجاء كتابة رد');
      return;
    }

    try {
      const updatedTicket = await api.respondToSupportTicket(selectedTicket.id, reply);
      setTickets(tickets.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ));
      setSelectedTicket(updatedTicket);
      setReply('');
      toast.success('تم إرسال الرد بنجاح');
    } catch (error) {
      console.error('Failed to send reply', error);
      toast.error('فشل في إرسال الرد');
    }
  };

  const handleCloseTicket = async (ticketId: string) => {
    try {
      const updatedTicket = await api.closeSupportTicket(ticketId);
      setTickets(tickets.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      ));
      if (selectedTicket?.id === ticketId) {
        setSelectedTicket(updatedTicket);
      }
      toast.success('تم إغلاق التذكرة بنجاح');
    } catch (error) {
      console.error('Failed to close ticket', error);
      toast.error('فشل في إغلاق التذكرة');
    }
  };

  const filteredTickets = tickets.filter(ticket => 
    ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    ticket.message.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openTickets = filteredTickets.filter(ticket => ticket.status === 'open');
  const closedTickets = filteredTickets.filter(ticket => ticket.status === 'closed');

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">إدارة الدعم الفني</h1>
        <Button onClick={fetchTickets}>تحديث</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>تذاكر الدعم</CardTitle>
              <div className="mt-2">
                <Input 
                  placeholder="بحث في التذاكر..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="open">
                <TabsList className="w-full mb-4">
                  <TabsTrigger value="open" className="flex-1">تذاكر مفتوحة ({openTickets.length})</TabsTrigger>
                  <TabsTrigger value="closed" className="flex-1">تذاكر مغلقة ({closedTickets.length})</TabsTrigger>
                </TabsList>
                <TabsContent value="open" className="mt-0">
                  {isLoading ? (
                    <div className="text-center py-4">جاري التحميل...</div>
                  ) : openTickets.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">لا توجد تذاكر مفتوحة</div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {openTickets.map(ticket => (
                        <div 
                          key={ticket.id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedTicket?.id === ticket.id ? 'bg-brand-50 border-brand-200' : ''
                          }`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <Badge variant="success">مفتوح</Badge>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <User className="h-3 w-3 mr-1" />
                            <span className="ml-1">
                              {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                <TabsContent value="closed" className="mt-0">
                  {isLoading ? (
                    <div className="text-center py-4">جاري التحميل...</div>
                  ) : closedTickets.length === 0 ? (
                    <div className="text-center py-4 text-gray-500">لا توجد تذاكر مغلقة</div>
                  ) : (
                    <div className="space-y-2 max-h-[400px] overflow-y-auto">
                      {closedTickets.map(ticket => (
                        <div 
                          key={ticket.id}
                          className={`p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors ${
                            selectedTicket?.id === ticket.id ? 'bg-gray-100' : ''
                          }`}
                          onClick={() => setSelectedTicket(ticket)}
                        >
                          <div className="flex justify-between items-start">
                            <h3 className="font-medium">{ticket.subject}</h3>
                            <Badge variant="secondary">مغلق</Badge>
                          </div>
                          <div className="flex items-center text-xs text-gray-500 mt-1">
                            <User className="h-3 w-3 mr-1" />
                            <span className="ml-1">
                              {new Date(ticket.createdAt).toLocaleDateString('ar-SA')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          {selectedTicket ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>{selectedTicket.subject}</CardTitle>
                  {selectedTicket.status === 'open' && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => handleCloseTicket(selectedTicket.id)}
                    >
                      إغلاق التذكرة
                    </Button>
                  )}
                </div>
                <CardDescription>
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span>
                      تم الإنشاء: {new Date(selectedTicket.createdAt).toLocaleString('ar-SA')}
                    </span>
                  </div>
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Original Message */}
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <p className="text-gray-700">{selectedTicket.message}</p>
                  </div>
                  
                  {/* Responses */}
                  {selectedTicket.responses.length > 0 && (
                    <div className="space-y-4 mt-6">
                      <h4 className="text-sm font-medium">الردود</h4>
                      {selectedTicket.responses.map((response, index) => (
                        <div 
                          key={index}
                          className={`p-4 rounded-lg ${
                            response.fromAdmin 
                              ? 'bg-brand-50 mr-4'
                              : 'bg-gray-100 ml-4'
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            <div className={`h-6 w-6 rounded-full flex items-center justify-center ${
                              response.fromAdmin ? 'bg-brand-200' : 'bg-gray-300'
                            }`}>
                              {response.fromAdmin ? (
                                <MessageSquare className="h-3 w-3" />
                              ) : (
                                <User className="h-3 w-3" />
                              )}
                            </div>
                            <span className="text-sm font-medium">
                              {response.fromAdmin ? 'فريق الدعم' : 'المستخدم'}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(response.createdAt).toLocaleString('ar-SA')}
                            </span>
                          </div>
                          <p>{response.message}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Reply Form */}
                  {selectedTicket.status === 'open' && (
                    <div className="mt-6 space-y-4">
                      <h4 className="text-sm font-medium">إضافة رد</h4>
                      <Textarea
                        placeholder="اكتب الرد هنا..."
                        className="min-h-[120px]"
                        value={reply}
                        onChange={(e) => setReply(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button onClick={handleSendReply}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          إرسال الرد
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="flex items-center justify-center h-full">
              <CardContent className="py-10 text-center">
                <Mail className="h-12 w-12 mx-auto text-gray-400" />
                <p className="mt-4 text-gray-500">اختر تذكرة من القائمة لعرض التفاصيل</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminSupport;
