
import React from 'react';
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const TableSkeleton = ({ rows = 5, cells = 4 }) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          {Array.from({ length: cells }).map((_, i) => (
            <TableHead key={i}>
              <Skeleton className="h-5 w-24" />
            </TableHead>
          ))}
        </TableRow>
      </TableHeader>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            {Array.from({ length: cells }).map((_, j) => (
              <TableCell key={j}>
                <Skeleton className="h-5 w-full" />
              </TableCell>
            ))}
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default TableSkeleton;
