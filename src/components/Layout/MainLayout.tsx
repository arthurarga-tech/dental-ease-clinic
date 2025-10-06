import { Sidebar } from "./Sidebar";
import { MobileNav } from "./MobileNav";
import { Stethoscope } from "lucide-react";

interface MainLayoutProps {
  children: React.ReactNode;
}

export const MainLayout = ({ children }: MainLayoutProps) => {
  return (
    <div className="flex h-screen bg-background">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 h-14 bg-card border-b flex items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-primary rounded">
            <Stethoscope className="w-4 h-4 text-primary-foreground" />
          </div>
          <span className="font-bold text-foreground">DentalCare</span>
        </div>
        <MobileNav />
      </div>
      
      {/* Main Content */}
      <main className="flex-1 overflow-auto md:mt-0 mt-14">
        {children}
      </main>
    </div>
  );
};