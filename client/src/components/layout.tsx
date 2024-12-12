import { Link, useLocation } from "wouter";
import Footer from "./ui/footer";
import { Timer, User } from "lucide-react";
import { useAuthStore } from "../lib/authStore";

export const Header = () => {
  const { user } = useAuthStore();
  const [location] = useLocation();

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-white/80 backdrop-blur-sm border-b z-50 shadow-sm">
      <div className="container mx-auto h-full flex items-center justify-center px-4">
        <Link href="/">
          <a className="text-2xl font-bold text-gray-800 hover:text-gray-600 transition-colors flex items-center gap-2">
            <Timer className="w-6 h-6 text-green-500" />
            HabiTimer Pro
          </a>
        </Link>
        {location !== "/auth" && (
          <div className="absolute right-4">
            <Link href="/mypage">
              <div 
                className="w-10 h-10 rounded-full hover:bg-gray-100 transition-colors cursor-pointer overflow-hidden flex items-center justify-center"
              >
                {user?.avatar_url ? (
                  <img
                    src={user.avatar_url}
                    className="w-full h-full rounded-full object-cover"
                    aria-hidden="true"
                  />
                ) : (
                  <User 
                    className="w-8 h-8 text-gray-600"
                    aria-hidden="true"
                  />
                )}
              </div>
            </Link>
          </div>
        )}
      </div>
    </header>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
