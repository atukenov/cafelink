"use client";

import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import React from "react";

export interface PageHeaderProps {
  title: string;
  backHref: string;
  rightElement?: React.ReactNode;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  backHref,
  rightElement,
  className = "",
}) => {
  return (
    <div className={`bg-white shadow-sm sticky top-0 z-10 ${className}`}>
      <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="p-2 hover:bg-gray-100 rounded-full">
            <ArrowLeft className="w-5 h-5 text-gray-400" />
          </Link>
          <h1 className="text-xl font-bold text-gray-800">{title}</h1>
        </div>
        {rightElement && <div>{rightElement}</div>}
      </div>
    </div>
  );
};
