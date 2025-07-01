
import React from 'react';
import { Search, Bell } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useData } from '@/contexts/DataContext';
import { useAuth } from '@/contexts/ApiAuthContext';
import { useNavigate } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';

const Header = () => {
  const { toast } = useToast();
  const { data, markNotificationsAsRead } = useData();
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const notifications = Array.isArray(data?.notifications) ? data.notifications.filter(n => n && n.id && n.message) : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  const handleNotImplemented = () => {
    toast({
      title: "🚧 Feature Not Implemented",
      description: "This feature isn't implemented yet—but don't worry! You can request it in your next prompt! 🚀",
      variant: "destructive",
    });
  };

  const getInitials = (name) => {
    if (!name) return 'U';
    const names = name.split(' ');
    return names.map(n => n[0]).join('').toUpperCase();
  };
  
  if (!user) return null;

  return (
    <header className="h-16 flex items-center justify-between px-6 border-b border-border bg-background">
      <div className="flex items-center gap-4">
        {/* Mobile nav can be added here */}
      </div>
      {/* <div className="flex-1 max-w-md">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input placeholder="Search contracts, clients, etc..." className="pl-10" onClick={handleNotImplemented} />
        </div>
      </div> */}
      <div className="flex items-center gap-4">
        <DropdownMenu onOpenChange={(open) => open && unreadCount > 0 && markNotificationsAsRead()}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && <Badge className="absolute -top-1 -right-1 h-4 w-4 justify-center p-0">{unreadCount}</Badge>}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-80" align="end">
            <DropdownMenuLabel>Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length > 0 ? notifications.slice(0, 5).map(n => (
              <DropdownMenuItem key={n.id} className="flex flex-col items-start whitespace-normal">
                <p className="text-sm font-medium">{n.message}</p>
                <p className="text-xs text-muted-foreground">{new Date(n.timestamp).toLocaleString()}</p>
              </DropdownMenuItem>
            )) : <DropdownMenuItem>No new notifications</DropdownMenuItem>}
          </DropdownMenuContent>
        </DropdownMenu>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full">
              <Avatar>
                <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} alt={user.name} />
                <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{user.name}</p>
                <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={async () => {
              await logout();
              navigate('/login');
            }}>
              Log out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
