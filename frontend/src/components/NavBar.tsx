import { Mail, Code } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

export const NavBar = () => {
  const location = useLocation();
  
  const navItems = [
    {
      name: "Herramienta de desarrollo",
      path: "/",
      icon: <Mail className="h-4 w-4 mr-2" />,
    },
    {
      name: "Conocimiento",
      path: "/data",
      icon: <Code className="h-4 w-4 mr-2" />,
    },
  ];

  return (
    <div className="fixed top-0 left-0 w-full bg-background/80 backdrop-blur-sm border-b z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="p-2 rounded-xl bg-gradient-to-r from-primary to-primary-glow text-primary-foreground">
              <Mail className="h-6 w-6" />
            </div>
            <span className="ml-2 text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
              PuertasTHT
            </span>
          </div>
          
          <nav className="flex space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors",
                  location.pathname === item.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/60 hover:text-primary hover:bg-primary/5"
                )}
              >
                {item.icon}
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
};
