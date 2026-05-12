import React from "react";
import { cn } from "../../lib/utils";

const Table = React.forwardRef(({ className, ...props }, ref) => (
  <div className="relative w-full overflow-auto">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props} />
  </div>
));

const TableHeader = React.forwardRef(({ className, ...props }, ref) => (
  <thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props} />
));

const TableBody = React.forwardRef(({ className, ...props }, ref) => (
  <tbody
    ref={ref}
    className={cn("[&_tr:last-child]:border-0", className)}
    {...props}
  />
));

const TableRow = React.forwardRef(({ className, ...props }, ref) => (
  <tr
    ref={ref}
    className={cn(
      "border-b border-border/60 transition-colors hover:bg-muted/30",
      className
    )}
    {...props}
  />
));

const TableHead = React.forwardRef(({ className, ...props }, ref) => (
  <th
    ref={ref}
    className={cn(
      "h-12 px-4 text-left align-middle text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground",
      className
    )}
    {...props}
  />
));

const TableCell = React.forwardRef(({ className, ...props }, ref) => (
  <td ref={ref} className={cn("p-4 align-middle", className)} {...props} />
));

Table.displayName = "Table";
TableHeader.displayName = "TableHeader";
TableBody.displayName = "TableBody";
TableRow.displayName = "TableRow";
TableHead.displayName = "TableHead";
TableCell.displayName = "TableCell";

export { Table, TableHeader, TableBody, TableRow, TableHead, TableCell };
