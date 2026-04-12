import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, LayoutDashboard } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="border-b border-slate-200 bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link
          to="/projects"
          className="flex items-center gap-2 font-bold text-base sm:text-lg text-indigo-600 flex-shrink-0"
        >
          <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <LayoutDashboard size={15} className="text-white" />
          </div>
          TaskFlow
        </Link>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
          {/* Avatar + name */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-7 h-7 rounded-full bg-indigo-100 flex items-center
              justify-center text-indigo-600 font-semibold text-xs flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-sm font-medium text-slate-700 truncate max-w-[80px] sm:max-w-none">
              {user?.name}
            </span>
          </div>

          <div className="w-px h-4 bg-slate-200 flex-shrink-0" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-1.5 text-sm text-slate-500
              hover:text-red-500 transition-colors font-medium flex-shrink-0"
          >
            <LogOut size={15} />
            <span className="hidden sm:inline">Logout</span>
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;