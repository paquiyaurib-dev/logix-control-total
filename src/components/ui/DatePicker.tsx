import { Calendar } from 'lucide-react';

interface DatePickerProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function DatePicker({
  label,
  value,
  onChange,
  className = '',
}: DatePickerProps) {
  return (
    <div className={['flex flex-col gap-1.5', className].join(' ')}>
      {label && (
        <label className="text-xs font-medium text-[#6B7A99] uppercase tracking-wider">
          {label}
        </label>
      )}
      <div className="relative">
        <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6B7A99] pointer-events-none" />
        <input
          type="date"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={[
            'w-full pl-10 pr-4 py-2 text-sm rounded-lg',
            'bg-white border border-[#E2E6EF] text-[#1B2A4A]',
            'focus:outline-none focus:ring-2 focus:ring-[#E8672C]/40 focus:border-[#E8672C]',
            'transition-shadow duration-150',
            '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:inset-0 [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer',
          ].join(' ')}
        />
      </div>
    </div>
  );
}
