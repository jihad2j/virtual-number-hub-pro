
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
    <div dir="rtl" className="min-h-screen bg-gradient-ocean bg-pattern-ocean p-4 flex items-center justify-center">
      <div className="w-full max-w-md relative">
        {/* Logo Section - Inspired by the geometric logo in the images */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative mx-auto mb-6">
            <div className="w-24 h-24 mx-auto relative">
              {/* Geometric logo inspired by the uploaded images */}
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl animate-float">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative">
                    {/* Main geometric shape */}
                    <div className="w-12 h-12 bg-gradient-to-br from-white/40 to-white/20 rounded-lg transform rotate-45"></div>
                    <div className="absolute top-1 left-1 w-8 h-8 bg-gradient-to-br from-ocean-accent/60 to-ocean-primary/60 rounded-md transform rotate-45"></div>
                    <div className="absolute top-2 left-2 w-4 h-4 bg-white/80 rounded-sm transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">تسجيل الدخول</h1>
          <p className="text-white/80 text-lg drop-shadow">منصة شام كاش للخدمات المالية</p>
        </div>
        
        {/* Login Card */}
        <Card className="glass-card border-0 shadow-2xl animate-slide-up overflow-hidden">
          <CardContent className="p-8">
            {error && (
              <div className="mb-6 p-4 bg-red-500/20 backdrop-blur-sm text-white rounded-xl border border-red-400/30 animate-fade-in">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-400 rounded-full"></div>
                  {error}
                </div>
              </div>
            )}
            
            {/* Demo Accounts */}
            <div className="mb-8 p-6 glass-morphism rounded-2xl">
              <p className="text-white/90 mb-4 font-medium text-center">🔐 حسابات تجريبية:</p>
              <div className="flex gap-3 justify-center">
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => fillDemoCredentials('admin')}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2"
                >
                  👨‍💼 مدير
                </Button>
                <Button 
                  type="button"
                  variant="outline" 
                  size="sm"
                  onClick={() => fillDemoCredentials('user')}
                  className="bg-white/10 border-white/30 text-white hover:bg-white/20 backdrop-blur-sm rounded-xl px-4 py-2"
                >
                  👤 مستخدم
                </Button>
              </div>
            </div>

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="email" className="text-white/90 font-medium flex items-center gap-2 text-base">
                  <Mail className="h-4 w-4" />
                  البريد الإلكتروني
                </Label>
                <Input 
                  id="email"
                  type="email" 
                  placeholder="بريدك الإلكتروني" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="ltr ocean-input h-14 text-base rounded-xl"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="password" className="text-white/90 font-medium flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4" />
                  كلمة المرور
                </Label>
                <div className="relative">
                  <Input 
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="ltr ocean-input h-14 text-base pr-14 rounded-xl"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 hover:text-white transition-colors"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-white/20 hover:bg-white/30 text-white h-14 text-base font-semibold rounded-xl backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-105 shadow-xl" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري تسجيل الدخول...
                  </div>
                ) : (
                  'تسجيل الدخول'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-between p-8 pt-0">
            <Link 
              to="/forgot-password" 
              className="text-white/80 hover:text-white transition-colors font-medium text-sm"
            >
              نسيت كلمة المرور؟
            </Link>
            <Link 
              to="/register" 
              className="text-white/80 hover:text-white transition-colors font-medium text-sm"
            >
              إنشاء حساب جديد
            </Link>
          </CardFooter>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-8 text-white/60 text-sm space-y-1">
          <p>POWERED BY</p>
          <p className="font-semibold text-white/80">Sham Cash ©</p>
          <p>V 2.0.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
