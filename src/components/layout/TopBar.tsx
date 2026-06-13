import { Menu, Search, Bell, FileText } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface TopBarProps {
  title: string;
  onMenuClick: () => void;
}

export default function TopBar({ title, onMenuClick }: TopBarProps) {
  const { state } = useAuth();

  return (
    <header className="h-14 bg-white border-b border-[#E2E6EF] flex items-center justify-between px-3 lg:px-4 shrink-0">
      {/* Left */}
      <div className="flex items-center gap-2.5">
        <button onClick={onMenuClick} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 text-[#6B7A99]">
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="font-display font-semibold text-base lg:text-lg text-[#1B2A4A]">{title}</h1>
      </div>

      {/* Right */}
      <div className="flex items-center gap-2">
        {/* Search */}
        <div className="hidden md:flex items-center relative">
          <Search className="absolute left-3 w-4 h-4 text-[#6B7A99]" />
          <input
            type="text"
            placeholder="Buscar..."
            className="pl-9 pr-3 py-1.5 text-xs rounded-lg bg-gray-50 border border-[#E2E6EF] w-56 focus:outline-none focus:ring-2 focus:ring-[#E8672C]/30 text-[#1B2A4A] placeholder-[#6B7A99]/60"
          />
        </div>

        {/* Notifications */}
        <button className="relative p-1.5 rounded-lg hover:bg-gray-100 text-[#6B7A99]">
          <Bell className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#E8672C] text-white text-[10px] font-bold rounded-full flex items-center justify-center">5</span>
        </button>

        {/* Documents */}
        <button className="relative p-1.5 rounded-lg hover:bg-gray-100 text-[#6B7A99]">
          <FileText className="w-4 h-4" />
          <span className="absolute top-1 right-1 w-4 h-4 bg-[#1B2A4A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">3</span>
        </button>

        {/* User */}
        {state.user && (
          <div className="flex items-center gap-2 ml-1">
            <div className="w-7 h-7 rounded-full bg-[#E8672C] text-white text-[11px] font-bold flex items-center justify-center">
              {state.user.avatar}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-medium text-[#1B2A4A] leading-none">{state.user.nombre}</p>
              <p className="text-[11px] text-[#6B7A99]">{state.user.rol}</p>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
