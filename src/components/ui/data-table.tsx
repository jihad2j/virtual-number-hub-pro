
import React from 'react';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";

interface DataTableProps<TData> {
  columns: {
    accessorKey?: string;
    id?: string;
    header: React.ReactNode;
    cell?: (props: { row: TData }) => React.ReactNode;
  }[];
  data: TData[];
}

export function DataTable<TData>({
  columns,
  data,
}: DataTableProps<TData>) {
  return (
    <div className="w-full">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column, index) => (
              <TableHead key={column.id || column.accessorKey || index}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length > 0 ? (
            data.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((column, columnIndex) => (
                  <TableCell key={column.id || column.accessorKey || columnIndex}>
                    {column.cell
                      ? column.cell({ row })
                      : column.accessorKey
                      ? (row as any)[column.accessorKey]
                      : null}
                  </TableCell>
                ))}
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="text-center py-6">
                لا توجد بيانات
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
