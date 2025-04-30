
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/contexts/AuthContext";
import { api, SupportTicket } from "@/services/api";
import { toast } from "sonner";

const Support = () => {
  const { user } = useAuth();
  const [tickets, setTickets] = useState<SupportTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [replyMessage, setReplyMessage] = useState("");
  const [replyingToTicket, setReplyingToTicket] = useState<string | null>(null);
  
  useEffect(() => {
    if (user) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [user]);
  
  const fetchTickets = async () => {
    try {
      setLoading(true);
      const userTickets = await api.getUserSupportTickets();
      setTickets(userTickets);
    } catch (error) {
      console.error("Failed to fetch support tickets", error);
      toast.error("فشل في جلب تذاكر الدعم");
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) {
      toast.error("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    
    try {
      await api.createSupportTicket(subject, message);
      toast.success("تم إنشاء تذكرة الدعم بنجاح");
      setSubject("");
      setMessage("");
      fetchTickets();
    } catch (error) {
      console.error("Failed to create support ticket", error);
      toast.error("فشل في إنشاء تذكرة الدعم");
    }
  };
  
  const handleReplyToTicket = async (ticketId: string) => {
    if (!replyMessage.trim()) {
      toast.error("الرجاء إدخال رسالة للرد");
      return;
    }
    
    try {
      await api.respondToTicket(ticketId, replyMessage);
      setReplyMessage("");
      setReplyingToTicket(null);
      toast.success("تم إرسال الرد بنجاح");
      fetchTickets();
    } catch (error) {
      console.error("Failed to respond to ticket", error);
      toast.error("فشل في إرسال الرد");
    }
  };
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-green-500">مفتوح</Badge>;
      case "closed":
        return <Badge className="bg-gray-500">مغلق</Badge>;
      case "pending":
        return <Badge className="bg-yellow-500">قيد المعالجة</Badge>;
      default:
        return <Badge>غير معروف</Badge>;
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <Card className="text-center py-8">
        <CardContent>
          <p className="text-gray-500">يرجى تسجيل الدخول للوصول إلى قسم الدعم الفني</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold mb-6">الدعم الفني</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>إنشاء تذكرة دعم جديدة</CardTitle>
              <CardDescription>أرسل استفسارك إلى فريق الدعم الفني</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmitTicket} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="subject">الموضوع</Label>
                  <Input
                    id="subject"
                    placeholder="أدخل موضوع التذكرة"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="message">الرسالة</Label>
                  <Textarea
                    id="message"
                    placeholder="أدخل تفاصيل المشكلة أو الاستفسار"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={5}
                    required
                  />
                </div>
                
                <Button type="submit" className="w-full">إرسال التذكرة</Button>
              </form>
            </CardContent>
          </Card>
        </div>
        
        <div className="md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">تذاكر الدعم الفني</h2>
          
          {tickets.length === 0 ? (
            <Card className="text-center py-8">
              <CardContent>
                <p className="text-gray-500">لا توجد تذاكر دعم فني سابقة</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id}>
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div>
                        <CardTitle>{ticket.subject}</CardTitle>
                        <CardDescription>
                          {new Date(ticket.createdAt).toLocaleString('ar')}
                        </CardDescription>
                      </div>
                      {getStatusBadge(ticket.status)}
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-2">
                    <div className="bg-gray-50 p-3 rounded-md mb-4">
                      <p className="text-gray-700">{ticket.message}</p>
                    </div>
                    
                    {ticket.responses && ticket.responses.length > 0 && (
                      <div className="space-y-3 mt-4">
                        {ticket.responses.map((response) => (
                          <div 
                            key={response.id} 
                            className={`p-3 rounded-md ${response.isAdmin ? 'bg-blue-50 border-r-4 border-blue-500' : 'bg-gray-50'}`}
                          >
                            <p className="text-sm text-gray-500 mb-1">
                              {response.isAdmin ? 'فريق الدعم' : 'أنت'} - {new Date(response.createdAt).toLocaleString('ar')}
                            </p>
                            <p className="text-gray-700">{response.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  
                  {ticket.status !== "closed" && (
                    <CardFooter className="border-t pt-3">
                      {replyingToTicket === ticket.id ? (
                        <div className="w-full space-y-3">
                          <Textarea 
                            placeholder="اكتب ردك هنا..."
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            rows={3}
                          />
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="outline" 
                              onClick={() => {
                                setReplyingToTicket(null);
                                setReplyMessage("");
                              }}
                            >
                              إلغاء
                            </Button>
                            <Button 
                              onClick={() => handleReplyToTicket(ticket.id)}
                            >
                              إرسال
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setReplyingToTicket(ticket.id)}
                        >
                          إضافة رد
                        </Button>
                      )}
                    </CardFooter>
                  )}
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Support;
