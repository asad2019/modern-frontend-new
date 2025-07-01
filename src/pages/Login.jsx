
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from "@/components/ui/use-toast";
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/ApiAuthContext';

const Login = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading } = useAuth();
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const user = await login(formData.email, formData.password);
      toast({
        title: "Login Successful!",
        description: `Welcome back, ${user.name}!`,
      });
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.response?.data?.error?.message || error.message || "Invalid email/username or password.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  };

  const handleQuickLogin = (credentials) => {
    setFormData(credentials);
  };
  
  if (isLoading || (!isLoading && isAuthenticated)) {
    return (
      <div className="min-h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <div className="text-lg font-medium">Authenticating...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background p-4">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-primary">Modern Textiles</h1>
          <p className="text-muted-foreground mt-2">Sign in to your account</p>
        </div>
        
        <div className="bg-muted/50 p-4 rounded-lg mb-6 text-sm">
          <h3 className="font-semibold mb-3">Demo Credentials (Click to use):</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => handleQuickLogin({ email: 'admin@moderntextiles.com', password: 'admin123' })}
            >
              <div>
                <div className="font-medium">Admin User</div>
                <div className="text-xs text-muted-foreground">Email: admin@moderntextiles.com | Password: admin123</div>
              </div>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full justify-start text-left h-auto py-2"
              onClick={() => handleQuickLogin({ email: 'manager@moderntextiles.com', password: 'manager123' })}
            >
              <div>
                <div className="font-medium">Production Manager</div>
                <div className="text-xs text-muted-foreground">Email: manager@moderntextiles.com | Password: manager123</div>
              </div>
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">Note: Backend must be running for login to work.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email or Username</Label>
            <Input 
              id="email" 
              type="text" 
              value={formData.email} 
              onChange={handleInputChange} 
              placeholder="Enter your email or username" 
              required 
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input 
              id="password" 
              type="password" 
              value={formData.password} 
              onChange={handleInputChange} 
              placeholder="••••••••" 
              required 
            />
          </div>
          <Button type="submit" className="w-full text-lg py-6" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
