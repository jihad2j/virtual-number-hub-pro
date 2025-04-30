
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { api, ManualRequest } from "@/services/api";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, CheckCircle, XCircle, Clock } from "lucide-react";

interface AdminManualRequest extends ManualRequest {
  userName?: string;
  userEmail?: string;
}

const ManualRequests = () => {
  const [requests, setRequests] = useState<AdminManualRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("pending");
  const [adminResponse, setAdminResponse] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [respondingToId, setRespondingToId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const allRequests = await api.getAllManualRequests();
      setRequests(allRequests);
    } catch (error) {
      console.error('Failed to fetch manual requests:', error);
      toast.error('فشل في جلب طلبات التفعيل اليدوي');
    } finally {
      setLoading(false);
    }
  };

  const handleRespondToRequest = async (requestId: string) => {
    if (!adminResponse && !verificationCode) {
      toast.error('يرجى إدخال رد أو رمز تحقق');
      return;
    }

    try {
      await api.respondToManualRequest(requestId, {
        adminResponse: adminResponse || undefined,
        verificationCode: verificationCode || undefined,
        status: 'processing'
      });
      
      // Update the request in the local state
      const updatedRequests = requests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            adminResponse: adminResponse || req.adminResponse,
            verificationCode: verificationCode || req.verificationCode,
            status: 'processing' as const,
            updatedAt: new Date().toISOString()
          };
        }
        return req;
      });

      setRequests(updatedRequests);
      setAdminResponse("");
      setVerificationCode("");
      setRespondingToId(null);
      toast.success('تم الرد على الطلب بنجاح');
    } catch (error) {
      console.error('Failed to respond to request:', error);
      toast.error('فشل في الرد على الطلب');
    }
  };

  const handleUpdateStatus = async (requestId: string, status: 'processing' | 'completed' | 'rejected') => {
    try {
      await api.updateManualRequestStatus(requestId, status);
      
      // Update the request in the local state
      const updatedRequests = requests.map(req => {
        if (req.id === requestId) {
          return {
            ...req,
            status,
            updatedAt: new Date().toISOString()
          };
        }
        return req;
      });

      setRequests(updatedRequests);
      toast.success(`تم تحديث حالة الطلب إلى ${getStatusText(status)}`);
    } catch (error) {
      console.error('Failed to update request status:', error);
      toast.error('فشل في تحديث حالة الطلب');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-500">قيد الانتظار</Badge>;
      case 'processing':
        return <Badge className="bg-blue-500">قيد المعالجة</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">مكتمل</Badge>;
      case 'rejected':
        return <Badge className="bg-red-500">ملغي</Badge>;
      default:
        return <Badge>غير معروف</Badge>;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'قيد الانتظار';
      case 'processing':
        return 'قيد المعالجة';
      case 'completed':
        return 'مكتمل';
      case 'rejected':
        return 'ملغي';
      default:
        return 'غير معروف';
    }
  };

  const filteredRequests = requests.filter(request => {
    if (activeTab === 'all') return true;
    return request.status === activeTab;
  });

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">إدارة طلبات التفعيل اليدوي</h1>
      
      <Tabs defaultValue="pending" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="pending">قيد الانتظار</TabsTrigger>
          <TabsTrigger value="processing">قيد المعالجة</TabsTrigger>
          <TabsTrigger value="completed">مكتملة</TabsTrigger>
          <TabsTrigger value="all">جميع الطلبات</TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="mt-0">
          <Card>
            <CardHeader>
              <CardTitle>
                طلبات التفعيل اليدوي {activeTab !== 'all' ? `(${getStatusText(activeTab)})` : ''}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  لا توجد طلبات {activeTab !== 'all' ? `${getStatusText(activeTab)}` : ''} حالياً
                </div>
              ) : (
                <Table>
                  <TableCaption>قائمة بجميع طلبات التفعيل اليدوي</TableCaption>
                  <TableHeader>
                    <TableRow>
                      <TableHead>المستخدم</TableHead>
                      <TableHead>الخدمة</TableHead>
                      <TableHead>الحالة</TableHead>
                      <TableHead>تاريخ الطلب</TableHead>
                      <TableHead>الإجراءات</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRequests.map((request) => (
                      <React.Fragment key={request.id}>
                        <TableRow>
                          <TableCell>
                            <div>{request.userName}</div>
                            <div className="text-sm text-gray-500">{request.userEmail}</div>
                          </TableCell>
                          <TableCell>{request.serviceName}</TableCell>
                          <TableCell>{getStatusBadge(request.status)}</TableCell>
                          <TableCell>{new Date(request.createdAt).toLocaleString('ar-SA')}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {request.status === 'pending' && (
                                <Button
                                  variant="default"
                                  className="bg-blue-500 hover:bg-blue-600"
                                  size="sm"
                                  onClick={() => setRespondingToId(request.id === respondingToId ? null : request.id)}
                                >
                                  رد
                                </Button>
                              )}
                              
                              {request.status === 'processing' && (
                                <Button
                                  variant="default"
                                  className="bg-green-500 hover:bg-green-600"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(request.id, 'completed')}
                                >
                                  <CheckCircle className="h-4 w-4 ml-1" />
                                  إكمال
                                </Button>
                              )}
                              
                              {(request.status === 'pending' || request.status === 'processing') && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleUpdateStatus(request.id, 'rejected')}
                                >
                                  <XCircle className="h-4 w-4 ml-1" />
                                  إلغاء
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                        
                        {/* تفاصيل الطلب */}
                        <TableRow>
                          <TableCell colSpan={5} className="bg-gray-50">
                            <div className="p-2 space-y-2 text-sm">
                              {request.notes && (
                                <div>
                                  <span className="font-semibold">ملاحظات العميل:</span>
                                  <p className="text-gray-700">{request.notes}</p>
                                </div>
                              )}
                              
                              {request.adminResponse && (
                                <div>
                                  <span className="font-semibold">رد الإدارة:</span>
                                  <p className="text-gray-700">{request.adminResponse}</p>
                                </div>
                              )}
                              
                              {request.verificationCode && (
                                <div>
                                  <span className="font-semibold">رمز التحقق:</span>
                                  <p className="text-gray-700 font-mono">{request.verificationCode}</p>
                                </div>
                              )}
                              
                              {respondingToId === request.id && (
                                <div className="mt-4 p-3 border rounded-md bg-white space-y-3">
                                  <div>
                                    <Label htmlFor="adminResponse">رد الإدارة</Label>
                                    <Textarea
                                      id="adminResponse"
                                      placeholder="أضف رد للعميل"
                                      value={adminResponse}
                                      onChange={(e) => setAdminResponse(e.target.value)}
                                    />
                                  </div>
                                  
                                  <div>
                                    <Label htmlFor="verificationCode">رمز التحقق</Label>
                                    <Input
                                      id="verificationCode"
                                      placeholder="رمز التحقق من التفعيل"
                                      value={verificationCode}
                                      onChange={(e) => setVerificationCode(e.target.value)}
                                    />
                                  </div>
                                  
                                  <div className="flex justify-end gap-2">
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() => {
                                        setRespondingToId(null);
                                        setAdminResponse("");
                                        setVerificationCode("");
                                      }}
                                    >
                                      إلغاء
                                    </Button>
                                    <Button
                                      variant="default"
                                      size="sm"
                                      className="bg-blue-500 hover:bg-blue-600"
                                      onClick={() => handleRespondToRequest(request.id)}
                                    >
                                      <Clock className="h-4 w-4 ml-1" />
                                      إرسال الرد وبدء المعالجة
                                    </Button>
                                  </div>
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ManualRequests;
