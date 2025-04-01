
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { MessageSquareX } from "lucide-react";

const NotFound = () => {
  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-6">
          <div className="h-24 w-24 rounded-full bg-red-100 flex items-center justify-center">
            <MessageSquareX className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold mb-4 text-gray-900">404</h1>
        <p className="text-xl text-gray-600 mb-6">عذراً، الصفحة التي تبحث عنها غير موجودة</p>
        <Button asChild size="lg" className="gradient-bg">
          <Link to="/dashboard">العودة للرئيسية</Link>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
