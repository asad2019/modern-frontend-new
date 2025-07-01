import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/contexts/ApiAuthContext';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

const Profile = () => {
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState({
    name: '',
    email: '',
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setProfile({
        name: user.name || '',
        email: user.email || '',
        username: user.username || '',
        password: ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setProfile(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const updateData = {
        name: profile.name,
        email: profile.email,
        username: profile.username
      };
      
      if (profile.password) {
        updateData.password = profile.password;
      }
      
      await updateUser(updateData);
      toast({ 
        title: "Success", 
        description: "Your profile has been updated successfully." 
      });
      
      setProfile(prev => ({ ...prev, password: '' }));
    } catch (error) {
      toast({ 
        title: "Error", 
        description: error.message || "Failed to update profile.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  }

  if (!user) return <div>Loading...</div>;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
            <CardDescription>Manage your account settings and personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center space-x-4">
                <Avatar className="h-20 w-20">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={profile.name} />
                    <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                </Avatar>
                <Button type="button" variant="outline" onClick={() => toast({ title: "Feature Coming Soon", description: "Photo upload will be available soon!" })}>Change Photo</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profile.name} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile.email} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" value={profile.username} onChange={handleInputChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">New Password</Label>
                <Input id="password" type="password" placeholder="Leave blank to keep current password" value={profile.password} onChange={handleInputChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={user.role || 'N/A'} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="department">Department</Label>
                <Input id="department" value={user.department?.name || 'N/A'} disabled />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </motion.div>
  );
};

export default Profile;