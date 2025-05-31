import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Shield, Mail, Lock, Eye, EyeOff, Sparkles, User, Crown } from 'lucide-react';

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
    <div dir="rtl" className="min-h-screen bg-slate-50 bg-pattern-silver p-4 flex items-center justify-center">
      <div className="w-full max-w-md relative">
        {/* Floating particles effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-10 left-10 w-2 h-2 bg-orange-400/40 rounded-full animate-pulse"></div>
          <div className="absolute top-20 right-20 w-3 h-3 bg-blue-400/40 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-32 left-16 w-1 h-1 bg-orange-500/50 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-20 right-8 w-2 h-2 bg-blue-500/40 rounded-full animate-pulse delay-700"></div>
        </div>

        {/* Modern Logo Section */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative mx-auto mb-8">
            <div className="w-28 h-28 mx-auto relative">
              <div className="absolute inset-0 bg-white rounded-3xl shadow-xl border border-gray-200">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative">
                    {/* Modern geometric logo */}
                    <div className="w-16 h-16 bg-orange-500 rounded-2xl transform rotate-12 absolute"></div>
                    <div className="w-12 h-12 bg-blue-500 rounded-xl transform -rotate-12 relative z-10"></div>
                    <Sparkles className="absolute top-1 right-1 w-6 h-6 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-gray-800 mb-3 drop-shadow-sm">مرحباً بك</h1>
          <p className="text-gray-600 text-xl font-medium">منصة شام كاش</p>
        </div>
        
        {/* Modern Login Card */}
        <div className="border-gradient-colorful">
          <Card className="bg-white shadow-xl border-0 rounded-2xl animate-slide-up overflow-hidden">
            <CardContent className="p-10">
              {error && (
                <div className="mb-8 p-5 bg-red-500/20 backdrop-blur-sm text-white rounded-2xl border border-red-400/30 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}
              
              {/* Demo Accounts with clean design */}
              <div className="mb-10 p-8 bg-gray-50 rounded-2xl border border-gray-200">
                <p className="text-gray-700 mb-6 font-semibold text-center text-lg flex items-center justify-center gap-2">
                  <Shield className="w-5 h-5 text-orange-500" />
                  حسابات تجريبية
                </p>
                <div className="flex gap-4 justify-center">
                  <Button 
                    type="button"
                    variant="outline" 
                    size="lg"
                    onClick={() => fillDemoCredentials('admin')}
                    className="bg-orange-500 hover:bg-orange-600 text-white border-0 flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <Crown className="w-5 h-5" />
                    مدير
                  </Button>
                  <Button 
                    type="button"
                    variant="outline" 
                    size="lg"
                    onClick={() => fillDemoCredentials('user')}
                    className="bg-blue-500 hover:bg-blue-600 text-white border-0 flex items-center gap-2 px-6 py-3 text-base font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <User className="w-5 h-5" />
                    مستخدم
                  </Button>
                </div>
              </div>

              {/* Clean Login Form */}
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="email" className="text-gray-700 font-semibold flex items-center gap-3 text-lg">
                    <Mail className="h-5 w-5 text-orange-500" />
                    البريد الإلكتروني
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="أدخل بريدك الإلكتروني" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="ltr h-16 text-lg rounded-xl border-gray-300 focus:border-orange-500 focus:ring-orange-200 bg-white"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="password" className="text-gray-700 font-semibold flex items-center gap-3 text-lg">
                    <Lock className="h-5 w-5 text-blue-500" />
                    كلمة المرور
                  </Label>
                  <div className="relative">
                    <Input 
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="أدخل كلمة المرور"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      className="ltr h-16 text-lg pr-16 rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-200 bg-white"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute left-5 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-300"
                    >
                      {showPassword ? <EyeOff className="h-6 w-6" /> : <Eye className="h-6 w-6" />}
                    </button>
                  </div>
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full bg-orange-500 hover:bg-orange-600 h-16 text-lg font-bold rounded-xl transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl border-0" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري تسجيل الدخول...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      تسجيل الدخول
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-between p-10 pt-0">
              <Link 
                to="/forgot-password" 
                className="text-gray-600 hover:text-orange-500 transition-colors font-semibold text-base hover:underline"
              >
                نسيت كلمة المرور؟
              </Link>
              <Link 
                to="/register" 
                className="text-gray-600 hover:text-blue-500 transition-colors font-semibold text-base hover:underline"
              >
                إنشاء حساب جديد
              </Link>
            </CardFooter>
          </Card>
        </div>
        
        {/* Clean Footer */}
        <div className="text-center mt-10 text-gray-600 text-base space-y-2">
          <p className="font-semibold">POWERED BY</p>
          <p className="font-bold text-gray-800 text-xl">
            <span className="text-orange-500">Sham</span> <span className="text-blue-500">Cash</span> ©
          </p>
          <p className="font-medium">V 2.0.0 - Clean Edition</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
