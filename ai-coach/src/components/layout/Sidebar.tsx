import Link from 'next/link';
import { Home, Briefcase, BookOpen, Settings, UserCircle } from 'lucide-react';

export default function Sidebar() {
  return (
    <aside className="w-64 border-r bg-muted/30 hidden md:flex flex-col">
      <div className="h-16 flex items-center px-6 border-b">
        <Briefcase className="w-6 h-6 mr-2 text-primary" />
        <span className="font-bold text-lg tracking-tight">Interview Coach</span>
      </div>
      
      <nav className="flex-1 py-6 px-4 space-y-2">
        <Link 
          href="/" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg bg-primary/10 text-primary transition-colors"
        >
          <Home className="w-5 h-5" />
          <span className="font-medium">Dashboard</span>
        </Link>
        <Link 
          href="/interviews" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          <Briefcase className="w-5 h-5" />
          <span className="font-medium">Interviews</span>
        </Link>
        <Link 
          href="/study-plan" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          <BookOpen className="w-5 h-5" />
          <span className="font-medium">Study Plan</span>
        </Link>
      </nav>

      <div className="p-4 border-t">
        <Link 
          href="/settings" 
          className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
        >
          <Settings className="w-5 h-5" />
          <span className="font-medium">Settings</span>
        </Link>
        <div className="flex items-center space-x-3 px-3 py-2 mt-2">
          <UserCircle className="w-8 h-8 text-muted-foreground" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">Guest User</span>
            <span className="text-xs text-muted-foreground">Sign in</span>
          </div>
        </div>
      </div>
    </aside>
  );
}
