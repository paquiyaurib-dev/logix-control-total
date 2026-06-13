import React from 'react';

export interface Column<T> {
  key: string;
  label: string;
  render?: (row: T, index: number) => React.ReactNode;
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[];
  data: T[];
  onRowClick?: (row: T, index: number) => void;
  emptyMessage?: string;
}

export default function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  onRowClick,
  emptyMessage = 'No se encontraron registros.',
}: DataTableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-xl border border-[#E2E6EF] bg-white">
      <table className="w-full text-sm">
        {/* Header */}
        <thead>
          <tr className="bg-gray-50 border-b border-[#E2E6EF]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="px-4 py-3 text-left uppercase text-xs tracking-wider font-semibold text-[#6B7A99] whitespace-nowrap"
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        {/* Body */}
        <tbody>
          {data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                className="px-4 py-12 text-center text-[#6B7A99]"
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                onClick={() => onRowClick?.(row, rowIdx)}
                className={[
                  rowIdx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50',
                  'border-b border-[#E2E6EF] last:border-b-0',
                  'hover:bg-[#E8672C]/5 transition-colors duration-100',
                  onRowClick ? 'cursor-pointer' : '',
                ].join(' ')}
              >
                {columns.map((col) => (
                  <td
                    key={col.key}
                    className="px-4 py-3 text-[#1B2A4A] whitespace-nowrap"
                  >
                    {col.render
                      ? col.render(row, rowIdx)
                      : (row[col.key] as React.ReactNode) ?? '—'}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
