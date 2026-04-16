"use client";

import { useEffect, useState } from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Payment = {
  id: string;
  amount: number;
  created_at: string;
  player_name: string;
};

export function PaymentsTable() {
  const [data, setData] = useState<Payment[]>([]);

  useEffect(() => {
    fetch("/api/payments/me")
      .then((res) => res.json())
      .then((d) => setData(d || []));
  }, []);

  const columns: ColumnDef<Payment>[] = [
    {
      accessorKey: "player_name",
      header: "Player",
    },
    {
      accessorKey: "amount",
      header: "Amount",
      cell: ({ row }) => (
        <div className="text-right">
          €{(row.getValue("amount") as number / 100).toFixed(2)}
        </div>
      ),
    },
    {
      accessorKey: "created_at",
      header: "Date",
      cell: ({ row }) =>
        new Date(row.getValue("created_at")).toLocaleDateString(),
    },
  ];

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div>
      <h2 className="text-lg font-medium mb-2">Payment History</h2>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((h) => (
                  <TableHead key={h.id}>
                    {flexRender(
                      h.column.columnDef.header,
                      h.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>

          <TableBody>
            {table.getRowModel().rows.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={3} className="text-center">
                  No payments yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}