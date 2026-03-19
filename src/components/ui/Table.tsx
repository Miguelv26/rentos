import React from 'react';

interface TableProps {
  children: React.ReactNode;
  caption?: string;
}

export const Table: React.FC<TableProps> = ({ children, caption }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full" role="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        {children}
      </table>
    </div>
  );
};

interface TableHeaderProps {
  children: React.ReactNode;
}

export const TableHeader: React.FC<TableHeaderProps> = ({ children }) => {
  return (
    <thead className="border-b border-gray-800">
      {children}
    </thead>
  );
};

interface TableBodyProps {
  children: React.ReactNode;
}

export const TableBody: React.FC<TableBodyProps> = ({ children }) => {
  return <tbody>{children}</tbody>;
};

interface TableRowProps {
  children: React.ReactNode;
  hover?: boolean;
}

export const TableRow: React.FC<TableRowProps> = ({ children, hover = true }) => {
  return (
    <tr className={`border-b border-gray-800/50 ${hover ? 'hover:bg-[rgba(0,229,255,0.05)] transition-colors' : ''}`}>
      {children}
    </tr>
  );
};

interface TableHeadProps {
  children: React.ReactNode;
  className?: string;
}

export const TableHead: React.FC<TableHeadProps> = ({ children, className = '' }) => {
  return (
    <th scope="col" className={`text-left text-[10px] font-bold uppercase text-gray-500 tracking-wider py-3 px-4 ${className}`}>
      {children}
    </th>
  );
};

interface TableCellProps extends React.TdHTMLAttributes<HTMLTableCellElement> {
  children: React.ReactNode;
  className?: string;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', ...props }) => {
  return (
    <td className={`py-3 px-4 text-sm ${className}`} {...props}>
      {children}
    </td>
  );
};
