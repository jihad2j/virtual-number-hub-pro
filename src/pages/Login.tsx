
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      await login(email, password);
      navigate('/dashboard');
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-brand-600">Virtual Number Hub</h1>
          <p className="text-gray-600 mt-2">منصة شراء الأرقام الافتراضية</p>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-center">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center">
              أدخل بيانات حسابك للوصول إلى لوحة التحكم
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">البريد الإلكتروني</Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ltr"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">كلمة المرور</Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="ltr"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full gradient-bg" 
                disabled={isLoading}
              >
                {isLoading ? 'جاري التحميل...' : 'تسجيل الدخول'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Link to="/forgot-password" className="text-sm text-brand-500 hover:text-brand-600">
              نسيت كلمة المرور؟
            </Link>
            <Link to="/register" className="text-sm text-brand-500 hover:text-brand-600">
              إنشاء حساب جديد
            </Link>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Login;
