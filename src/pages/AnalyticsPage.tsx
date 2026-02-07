import { Link, useNavigate } from 'react-router-dom';
import { AnalyticsView } from '@/components/AnalyticsView';
import { Button } from '@/components/ui/button';
import { ClipboardList, CheckSquare } from 'lucide-react';

const AnalyticsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* App header */}
      <header className="flex items-center justify-between px-4 py-2 border-b bg-card">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">GT</span>
          </div>
          <div>
            <h1 className="font-semibold text-sm">Goal Tracker</h1>
            <p className="text-xs text-muted-foreground">Analytics Overview</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link to="/completed">
              <CheckSquare className="h-4 w-4 mr-1" />
              Completed
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/backlog">
              <ClipboardList className="h-4 w-4 mr-1" />
              Backlogs
            </Link>
          </Button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        <AnalyticsView onNavigateToGrid={() => navigate('/')} />
      </main>
    </div>
  );
};

export default AnalyticsPage;
