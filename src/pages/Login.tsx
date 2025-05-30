
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Shield, Mail, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      console.log("Attempting login with:", email);
      await login(email, password);
      console.log("Login successful, navigating to dashboard");
      setTimeout(() => {
        navigate('/dashboard');
      }, 100);
    } catch (error) {
      console.error('Login error:', error);
      setError('فشل تسجيل الدخول. تأكد من صحة البريد الإلكتروني وكلمة المرور');
      toast.error('فشل تسجيل الدخول');
    } finally {
      setIsLoading(false);
    }
  };

  const fillDemoCredentials = (type: 'admin' | 'user') => {
    if (type === 'admin') {
      setEmail('admin@admin.com');
      setPassword('admin123');
    } else {
      setEmail('user@user.com');
      setPassword('user123');
    }
  };

  return (
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-rajhi-primary via-rajhi-accent to-rajhi-secondary p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Ccircle cx="7" cy="7" r="7"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Virtual Number Hub</h1>
          <p className="text-rajhi-light text-lg drop-shadow">منصة شراء الأرقام الافتراضية الآمنة</p>
        </div>
        
        <Card className="rajhi-card border-0 shadow-2xl animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-rajhi-primary to-rajhi-accent text-white rounded-t-xl">
            <CardTitle className="text-2xl text-center font-bold">تسجيل الدخول</CardTitle>
            <CardDescription className="text-center text-rajhi-light">
              أدخل بيانات حسابك للوصول إلى لوحة التحكم الآمنة
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6">
            {error && (
              <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}
            
            <div className="mb-6 p-4 bg-gradient-to-r from-rajhi-light to-blue-50 rounded-lg border border-rajhi-accent/30">
              <p className="text-sm text-rajhi-primary mb-3 font-medium">🔐 حسابات تجريبية آمنة:</p>
              <div className="flex gap-2 text-xs">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => fillDemoCredentials('admin')}
                  className="border-rajhi-accent text-rajhi-primary hover:bg-rajhi-primary hover:text-white transition-all"
                >
                  👨‍💼 مدير النظام
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => fillDemoCredentials('user')}
                  className="border-rajhi-accent text-rajhi-primary hover:bg-rajhi-primary hover:text-white transition-all"
                >
                  👤 مستخدم عادي
                </Button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-rajhi-primary font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="your@email.com" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ltr rajhi-input h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-rajhi-primary font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="ltr rajhi-input h-12 text-base pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-rajhi-secondary hover:text-rajhi-primary transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full rajhi-button h-12 text-base font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول الآمن'
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between p-6 bg-rajhi-light/30 rounded-b-xl">
            <Link 
              to="/forgot-password" 
              className="text-sm text-rajhi-primary hover:text-rajhi-accent transition-colors font-medium"
            >
              نسيت كلمة المرور؟
            </Link>
            <Link 
              to="/register" 
              className="text-sm text-rajhi-primary hover:text-rajhi-accent transition-colors font-medium"
            >
              إنشاء حساب جديد
            </Link>
          </CardFooter>
        </Card>
        
        <div className="text-center mt-6 text-rajhi-light text-sm">
          <p>© 2024 Virtual Number Hub. جميع الحقوق محفوظة</p>
          <p className="mt-1">منصة آمنة ومرخصة لخدمات الأرقام الافتراضية</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
