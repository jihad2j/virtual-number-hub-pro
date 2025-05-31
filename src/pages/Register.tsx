
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Mail, Lock, User, Sparkles, UserPlus } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      await register(name, email, password);
      navigate('/dashboard');
    } catch (error: any) {
      console.error('Registration error:', error);
      setError(error?.response?.data?.message || 'حدث خطأ أثناء التسجيل. الرجاء المحاولة مرة أخرى.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div dir="rtl" className="min-h-screen modern-gradient bg-pattern-modern p-4 flex items-center justify-center">
      <div className="w-full max-w-md relative">
        {/* Floating particles effect */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
          <div className="absolute top-16 left-8 w-2 h-2 bg-white/30 rounded-full animate-pulse"></div>
          <div className="absolute top-32 right-12 w-3 h-3 bg-purple-primary/40 rounded-full animate-bounce delay-300"></div>
          <div className="absolute bottom-40 left-20 w-1 h-1 bg-emerald-primary/50 rounded-full animate-ping delay-500"></div>
          <div className="absolute bottom-24 right-6 w-2 h-2 bg-white/40 rounded-full animate-pulse delay-700"></div>
        </div>

        {/* Modern Logo Section */}
        <div className="text-center mb-10 animate-fade-in">
          <div className="relative mx-auto mb-8">
            <div className="w-28 h-28 mx-auto relative">
              <div className="absolute inset-0 glass-card glow-effect">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-gradient-to-br from-purple-primary/60 to-emerald-primary/60 rounded-2xl transform rotate-12 absolute"></div>
                    <div className="w-12 h-12 bg-gradient-to-br from-white/40 to-purple-primary/40 rounded-xl transform -rotate-12 relative z-10"></div>
                    <UserPlus className="absolute top-1 right-1 w-6 h-6 text-white/80" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-3 drop-shadow-2xl text-gradient">انضم إلينا</h1>
          <p className="text-white/90 text-xl drop-shadow-lg font-medium">إنشاء حساب جديد في شام كاش</p>
        </div>
        
        {/* Modern Register Card */}
        <div className="border-gradient">
          <Card className="glass-card border-0 shadow-2xl animate-slide-up overflow-hidden">
            <CardContent className="p-10">
              {error && (
                <div className="mb-8 p-5 bg-red-500/20 backdrop-blur-sm text-white rounded-2xl border border-red-400/30 animate-fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse"></div>
                    <span className="font-medium">{error}</span>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="space-y-4">
                  <Label htmlFor="name" className="text-white/90 font-semibold flex items-center gap-3 text-lg">
                    <User className="h-5 w-5 text-purple-primary" />
                    الاسم الكامل
                  </Label>
                  <Input 
                    id="name"
                    type="text" 
                    placeholder="أدخل اسمك الكامل" 
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="modern-input h-16 text-lg rounded-2xl backdrop-blur-md"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="email" className="text-white/90 font-semibold flex items-center gap-3 text-lg">
                    <Mail className="h-5 w-5 text-emerald-primary" />
                    البريد الإلكتروني
                  </Label>
                  <Input 
                    id="email"
                    type="email" 
                    placeholder="أدخل بريدك الإلكتروني" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="ltr modern-input h-16 text-lg rounded-2xl backdrop-blur-md"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="password" className="text-white/90 font-semibold flex items-center gap-3 text-lg">
                    <Lock className="h-5 w-5 text-purple-primary" />
                    كلمة المرور
                  </Label>
                  <Input 
                    id="password"
                    type="password" 
                    placeholder="أدخل كلمة المرور"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="ltr modern-input h-16 text-lg rounded-2xl backdrop-blur-md"
                  />
                </div>
                
                <div className="space-y-4">
                  <Label htmlFor="confirmPassword" className="text-white/90 font-semibold flex items-center gap-3 text-lg">
                    <Lock className="h-5 w-5 text-emerald-primary" />
                    تأكيد كلمة المرور
                  </Label>
                  <Input 
                    id="confirmPassword"
                    type="password" 
                    placeholder="أعد إدخال كلمة المرور"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="ltr modern-input h-16 text-lg rounded-2xl backdrop-blur-md"
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full modern-button h-16 text-lg font-bold rounded-2xl backdrop-blur-sm border border-white/20 transition-all duration-300 hover:scale-105 shadow-2xl glow-effect" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-3">
                      <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>جاري إنشاء الحساب...</span>
                    </div>
                  ) : (
                    <span className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5" />
                      إنشاء الحساب
                    </span>
                  )}
                </Button>
              </form>
            </CardContent>
            
            <CardFooter className="flex justify-center p-10 pt-0">
              <div className="text-white/80 text-base">
                لديك حساب بالفعل؟{' '}
                <Link to="/login" className="text-white hover:text-white/80 transition-colors font-semibold hover:underline">
                  تسجيل الدخول
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
        
        {/* Modern Footer */}
        <div className="text-center mt-10 text-white/70 text-base space-y-2">
          <p className="font-semibold">POWERED BY</p>
          <p className="font-bold text-white/90 text-xl text-gradient">Sham Cash ©</p>
          <p className="font-medium">V 2.0.0 - Modern Edition</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
