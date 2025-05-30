
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
    <div dir="rtl" className="min-h-screen flex items-center justify-center bg-gradient-to-br from-ocean-primary via-ocean-accent to-ocean-secondary p-4">
      <div className="absolute inset-0 bg-pattern opacity-30"></div>
      
      <div className="w-full max-w-md relative z-10">
        {/* Header Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="bg-white/20 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Shield className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2 drop-shadow-lg">Virtual Number Hub</h1>
          <p className="text-ocean-light text-lg drop-shadow">منصة شراء الأرقام الافتراضية الآمنة</p>
        </div>
        
        {/* Register Card */}
        <Card className="ocean-card border-0 shadow-2xl animate-slide-up">
          <CardHeader className="bg-gradient-to-r from-ocean-primary to-ocean-accent text-white rounded-t-xl">
            <CardTitle className="text-2xl text-center font-bold">إنشاء حساب جديد</CardTitle>
            <CardDescription className="text-center text-ocean-light">
              أدخل بياناتك لإنشاء حساب جديد آمن
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
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name" className="text-ocean-primary font-medium flex items-center gap-2">
                  <User className="h-4 w-4" />
                  الاسم الكامل
                </Label>
                <Input 
                  id="name"
                  type="text" 
                  placeholder="محمد أحمد" 
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="ocean-input h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email" className="text-ocean-primary font-medium flex items-center gap-2">
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
                  className="ltr ocean-input h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password" className="text-ocean-primary font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  كلمة المرور
                </Label>
                <Input 
                  id="password"
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="ltr ocean-input h-12 text-base"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-ocean-primary font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  تأكيد كلمة المرور
                </Label>
                <Input 
                  id="confirmPassword"
                  type="password" 
                  placeholder="••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="ltr ocean-input h-12 text-base"
                />
              </div>
              
              <Button 
                type="submit" 
                className="w-full ocean-button h-12 text-base font-semibold" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    جاري إنشاء الحساب...
                  </div>
                ) : (
                  'إنشاء الحساب الآن'
                )}
              </Button>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center p-6 bg-ocean-light/30 rounded-b-xl">
            <div className="text-sm">
              لديك حساب بالفعل؟{' '}
              <Link to="/login" className="text-ocean-primary hover:text-ocean-accent transition-colors font-medium">
                تسجيل الدخول
              </Link>
            </div>
          </CardFooter>
        </Card>
        
        {/* Footer */}
        <div className="text-center mt-6 text-ocean-light text-sm">
          <p>© 2024 Virtual Number Hub. جميع الحقوق محفوظة</p>
          <p className="mt-1">منصة آمنة ومرخصة لخدمات الأرقام الافتراضية</p>
        </div>
      </div>
    </div>
  );
};

export default Register;
