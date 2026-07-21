'use client';

import {
  Folder,
  Home,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  User2,
  Users,
} from 'lucide-react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ErrorBoundary, type FallbackProps } from 'react-error-boundary';
import { useState } from 'react';
import type { CSSProperties } from 'react';
import type { LucideIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown';
import { paths } from '@/config/paths';
import { useLogout, useUser } from '@/lib/auth';
import { cn } from '@/utils/cn';

type NavigationItem = {
  name: string;
  to: string;
  icon: LucideIcon;
};

const SIDEBAR_WIDTH = 280;
const COLLAPSED_WIDTH = 72;

const Logo = ({ collapsed = false }: { collapsed?: boolean }) => (
  <NextLink
    className={cn(
      'flex min-w-0 items-center gap-3 text-white',
      collapsed && 'justify-center',
    )}
    href={paths.home.getHref()}
  >
    <img className="size-8 shrink-0" src="/logo.svg" alt="Bulletproof React" />
    {!collapsed && (
      <span className="truncate text-sm font-semibold">Bulletproof React</span>
    )}
  </NextLink>
);

const Navigation = ({
  items,
  pathname,
  collapsed = false,
  onNavigate,
}: {
  items: NavigationItem[];
  pathname: string;
  collapsed?: boolean;
  onNavigate?: () => void;
}) => (
  <nav className="flex flex-1 flex-col gap-1 px-3 py-4">
    {items.map((item) => {
      const active =
        pathname === item.to ||
        (item.to !== paths.app.root.getHref() &&
          pathname.startsWith(`${item.to}/`));
      return (
        <NextLink
          key={item.name}
          href={item.to}
          onClick={onNavigate}
          title={collapsed ? item.name : undefined}
          className={cn(
            'group flex h-11 items-center gap-3 rounded-md px-3 text-sm font-medium transition-colors',
            'text-slate-300 hover:bg-white/10 hover:text-white',
            active && 'bg-white/15 text-white',
            collapsed && 'justify-center px-0',
          )}
        >
          <item.icon className="size-5 shrink-0" aria-hidden="true" />
          {!collapsed && <span>{item.name}</span>}
        </NextLink>
      );
    })}
  </nav>
);

const Sidebar = ({
  items,
  pathname,
  collapsed,
  onToggle,
}: {
  items: NavigationItem[];
  pathname: string;
  collapsed: boolean;
  onToggle: () => void;
}) => (
  <aside
    style={
      {
        '--sidebar-width': `${collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH}px`,
      } as CSSProperties
    }
    className="fixed inset-y-0 left-0 z-40 hidden w-[var(--sidebar-width)] flex-col bg-[#355262] transition-[width] duration-200 lg:flex"
  >
    <div className="flex h-[62px] shrink-0 items-center border-b border-white/15 px-4">
      <Logo collapsed={collapsed} />
    </div>
    <Navigation items={items} pathname={pathname} collapsed={collapsed} />
    <div className="border-t border-white/15 p-3">
      <Button
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        size="icon"
        variant="ghost"
        className="w-full text-slate-300 hover:bg-white/10 hover:text-white"
        onClick={onToggle}
      >
        {collapsed ? (
          <PanelLeftOpen className="size-5" />
        ) : (
          <PanelLeftClose className="size-5" />
        )}
      </Button>
    </div>
  </aside>
);

const Layout = ({ children }: { children: React.ReactNode }) => {
  const user = useUser();
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const logout = useLogout({
    onSuccess: () => router.push(paths.auth.login.getHref(pathname)),
  });

  const navigation: NavigationItem[] = [
    { name: 'Dashboard', to: paths.app.root.getHref(), icon: Home },
    { name: 'Discussions', to: paths.app.discussions.getHref(), icon: Folder },
    ...(user.data?.role === 'ADMIN'
      ? [{ name: 'Users', to: paths.app.users.getHref(), icon: Users }]
      : []),
  ];

  return (
    <div className="min-h-screen bg-muted/40">
      <Sidebar
        items={navigation}
        pathname={pathname}
        collapsed={collapsed}
        onToggle={() => setCollapsed((value) => !value)}
      />

      <div
        className="min-h-screen transition-[padding] duration-200 lg:pl-[var(--sidebar-width)]"
        style={
          {
            '--sidebar-width': `${collapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH}px`,
          } as CSSProperties
        }
      >
        <header className="sticky top-0 z-30 flex h-[62px] items-center justify-between border-b bg-[#355262] px-4 lg:justify-end lg:px-6">
          <Drawer open={mobileOpen} onOpenChange={setMobileOpen}>
            <DrawerTrigger asChild>
              <Button
                size="icon"
                variant="ghost"
                className="text-white hover:bg-white/10 hover:text-white lg:hidden"
                aria-label="Open navigation"
              >
                <Menu className="size-5" />
              </Button>
            </DrawerTrigger>
            <DrawerContent
              side="left"
              className="bg-[#355262] p-0 text-white sm:max-w-[280px]"
            >
              <div className="flex h-[62px] items-center border-b border-white/15 px-4">
                <Logo />
              </div>
              <Navigation
                items={navigation}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            </DrawerContent>
          </Drawer>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full text-white hover:bg-white/10 hover:text-white"
                aria-label="Open user menu"
              >
                <User2 className="size-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => router.push(paths.app.profile.getHref())}>
                Your Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => logout.mutate()}>
                Sign Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="min-h-[calc(100vh-62px)] p-4 sm:p-6">{children}</main>
      </div>
    </div>
  );
};

function Fallback({ error }: FallbackProps) {
  return (
    <p>
      Error: {error instanceof Error ? error.message : 'Something went wrong!'}
    </p>
  );
}

export const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const pathname = usePathname();
  return (
    <Layout>
      <ErrorBoundary key={pathname} FallbackComponent={Fallback}>
        {children}
      </ErrorBoundary>
    </Layout>
  );
};
