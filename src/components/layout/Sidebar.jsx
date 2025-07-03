import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, FileText, Package, Truck, Scissors, Users, Factory, BarChart2, Settings, UserCircle, Layers, Anchor, MapPin, GitBranch, Repeat, PackagePlus, Beaker, Receipt, Shirt, Building, SprayCan, Wrench, ShieldCheck, HardHat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/ApiAuthContext';

const Sidebar = () => {
    const { user, isLoading, hasPermission } = useAuth();

    if (isLoading || !user) {
      return null;
    }

    const allNavItems = [
      { to: '/dashboard', icon: Home, label: 'Admin Dashboard', perm: 'all' },
      { to: '/production-dashboard', icon: Factory, label: 'Production', perm: 'production-dashboard' },
      { to: '/processing-dashboard', icon: Scissors, label: 'Processing', perm: 'processing-dashboard' },

      { type: 'divider', label: 'Management', perm: 'any' },
      { to: '/contracts', icon: FileText, label: 'Contracts', perm: 'contracts' },
      { to: '/clients', icon: Users, label: 'Clients', perm: 'clients' },
      { to: '/brokers', icon: UserCircle, label: 'Brokers', perm: 'clients' },
      { to: '/suppliers', icon: Building, label: 'Suppliers', perm: 'all' },
      { to: '/finishing-units', icon: SprayCan, label: 'Finishing Units', perm: 'all' },
      { to: '/sizing', icon: GitBranch, label: 'Sizing Accounts', perm: 'clients' },
      { to: '/stock', icon: Package, label: 'Stock Locations', perm: 'all' },
      { to: '/qualities', icon: Layers, label: 'Qualities', perm: 'qualities' },
      { to: '/looms', icon: Anchor, label: 'Looms', perm: 'production-dashboard' },

      { type: 'divider', label: 'Operations', perm: 'any' },
      { to: '/yarn', icon: Beaker, label: 'Yarn Management', perm: 'yarn' },
      { to: '/fabric', icon: Shirt, label: 'Fabric Management', perm: 'yarn' },
      { to: '/daily-production', icon: PackagePlus, label: 'Daily Production', perm: 'daily-production' },
      { to: '/transactions', icon: Repeat, label: 'Transactions', perm: 'transactions' },

      // { type: 'divider', label: 'Assets & QC', perm: 'any' },
      // { to: '/looms', icon: Anchor, label: 'Looms', perm: 'production-dashboard' },
      // { to: '/machines', icon: HardHat, label: 'Machines', perm: 'machines' },
      // { to: '/maintenance', icon: Wrench, label: 'Maintenance', perm: 'maintenance' },
      // { to: '/quality-control', icon: ShieldCheck, label: 'Quality Control', perm: 'quality_control' },

      { type: 'divider', label: 'Finance & Reporting', perm: 'any' },
      { to: '/costing', icon: BarChart2, label: 'Costing', perm: 'all' },
      { to: '/invoices', icon: Receipt, label: 'Invoices', perm: 'all' },
      { to: '/reports', icon: BarChart2, label: 'Reports', perm: 'reports' },
      { to: '/activity-log', icon: MapPin, label: 'Activity Logs', perm: 'all' },

      { type: 'divider', label: 'System', perm: 'any' },
      { to: '/users', icon: Users, label: 'User Management', perm: 'all' },
      { to: '/departments', icon: Truck, label: 'Departments', perm: 'all' },
      { to: '/profile', icon: UserCircle, label: 'Profile', perm: 'any' },
      // { to: '/settings', icon: Settings, label: 'Settings', perm: 'settings' },
    ];

    const visibleNavItems = allNavItems.filter(item => {
        if (item.type === 'divider') {
             const subsequentItems = allNavItems.slice(allNavItems.indexOf(item) + 1);
             const nextDividerIndex = subsequentItems.findIndex(i => i.type === 'divider');
             const sectionItems = subsequentItems.slice(0, nextDividerIndex > -1 ? nextDividerIndex : undefined);
             return sectionItems.some(si => !si.perm || si.perm === 'any' || hasPermission(si.perm));
        }
        if (!item.perm || item.perm === 'any') return true;
        return hasPermission(item.perm);
    });

  return (
    <aside className="w-64 bg-background border-r border-border flex-col hidden lg:flex">
      <div className="h-16 flex items-center justify-center border-b border-border">
        <h1 className="text-2xl font-bold text-primary">Modern Textiles</h1>
      </div>
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {visibleNavItems.map((item, index) =>
          item.type === 'divider' ? (
            (index !== 0 && visibleNavItems[index-1]?.type !== 'divider') &&
            <p key={index} className="px-4 pt-4 pb-1 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{item.label}</p>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )
              }
            >
              <item.icon className="mr-3 h-5 w-5" />
              <span>{item.label}</span>
            </NavLink>
          )
        )}
      </nav>
    </aside>
  );
};

export default Sidebar;