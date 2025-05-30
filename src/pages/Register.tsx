
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from '@/contexts/AuthContext';
import { Shield, Mail, Lock, User } from 'lucide-react';

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
    <div dir="rtl" className="min-h-screen bg-gradient-ocean bg-pattern-ocean p-4 flex items-center justify-center">
      <div className="w-full max-w-md relative">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="relative mx-auto mb-6">
            <div className="w-24 h-24 mx-auto relative">
              <div className="absolute inset-0 bg-white/20 backdrop-blur-sm rounded-3xl shadow-2xl animate-float">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 bg-gradient-to-br from-white/40 to-white/20 rounded-lg transform rotate-45"></div>
                    <div className="absolute top-1 left-1 w-8 h-8 bg-gradient-to-br from-ocean-accent/60 to-ocean-primary/60 rounded-md transform rotate-45"></div>
                    <div className="absolute top-2 left-2 w-4 h-4 bg-white/80 rounded-sm transform rotate-45"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2 drop-shadow-lg">إنشاء حساب جديد</h1>
          <p className="text-white/80 text-lg drop-shadow">انضم إلى منصة شام كاش</p>
        </div>
        
        {/* Register Card */}
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-3">
                <Label htmlFor="name" className="text-white/90 font-medium flex items-center gap-2 text-base">
                  <User className="h-4 w-4" />
                  الاسم الكامل
                </Label>
                <Input 
                  id="name"
                  type="text" 
                  placeholder="اسمك الكامل" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="ocean-input h-14 text-base rounded-xl"
                />
              </div>
              
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
                <Input 
                  id="password"
                  type="password" 
                  placeholder="كلمة المرور"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="ltr ocean-input h-14 text-base rounded-xl"
                />
              </div>
              
              <div className="space-y-3">
                <Label htmlFor="confirmPassword" className="text-white/90 font-medium flex items-center gap-2 text-base">
                  <Lock className="h-4 w-4" />
                  تأكيد كلمة المرور
                </Label>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  placeholder="تأكيد كلمة المرور"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="ltr ocean-input h-14 text-base rounded-xl"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full bg-white/20 hover:bg-white/30 text-white h-14 text-base font-semibold rounded-xl backdrop-blur-sm border border-white/30 transition-all duration-300 hover:scale-105 shadow-xl" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  'إنشاء الحساب'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center p-8 pt-0">
            <div className="text-white/80">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-white hover:text-white/80 transition-colors font-medium">
                تسجيل الدخول
              </Link>
            </div>
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

export default Register;
