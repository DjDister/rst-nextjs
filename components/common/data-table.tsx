"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal } from "lucide-react";
import { PaginationComponent } from "@/components/common/pagination";

export interface Column<T> {
  key: string;
  header: string;
  cell: (item: T) => React.ReactNode;
  width?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  actions?: {
    onEdit?: (item: T) => void;
    onDelete?: (item: T) => void;
    onView?: (item: T) => void;
  };
  onRowClick?: (item: T) => void;
  keyExtractor: (item: T) => string | number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function DataTable<T>({
  data,
  columns,
  actions,
  onRowClick,
  keyExtractor,
  currentPage,
  totalPages,
  onPageChange,
}: DataTableProps<T>) {
  return (
    <div className="w-full">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((column) => (
                <TableHead
                  key={column.key}
                  style={{ width: column.width || "auto" }}
                  className="whitespace-nowrap"
                >
                  {column.header}
                </TableHead>
              ))}
              {actions && <TableHead className="w-16"></TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (actions ? 1 : 0)}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={keyExtractor(item)}
                  onClick={onRowClick ? () => onRowClick(item) : undefined}
                  className={
                    onRowClick ? "cursor-pointer hover:bg-muted/50" : ""
                  }
                >
                  {columns.map((column) => (
                    <TableCell
                      key={`${keyExtractor(item)}-${column.key}`}
                      style={{ width: column.width || "auto" }}
                    >
                      {column.cell(item)}
                    </TableCell>
                  ))}
                  {actions && (
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger
                          asChild
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {actions.onView && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                actions.onView?.(item);
                              }}
                            >
                              View
                            </DropdownMenuItem>
                          )}
                          {actions.onEdit && (
                            <DropdownMenuItem
                              onClick={(e) => {
                                e.stopPropagation();
                                actions.onEdit?.(item);
                              }}
                            >
                              Edit
                            </DropdownMenuItem>
                          )}
                          {actions.onDelete && (
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                actions.onDelete?.(item);
                              }}
                            >
                              Delete
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      {totalPages > 1 && (
        <div className="mt-4 flex justify-center">
          <PaginationComponent
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
}
