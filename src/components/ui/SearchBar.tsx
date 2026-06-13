import { Search } from 'lucide-react';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({
  value,
  onChange,
  placeholder = 'Buscar...',
  className = '',
}: SearchBarProps) {
  return (
    <div className={['relative', className].join(' ')}>
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A99] pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          'w-full pl-10 pr-4 py-2 text-sm rounded-lg',
          'bg-white border border-[#E2E6EF] text-[#1B2A4A] placeholder-[#6B7A99]/60',
          'focus:outline-none focus:ring-2 focus:ring-[#E8672C]/40 focus:border-[#E8672C]',
          'transition-shadow duration-150',
        ].join(' ')}
      />
    </div>
  );
}
