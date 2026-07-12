import React from "react";

export default function PageHeader({ title, subtitle, children }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
      <div>
        <h1 className="font-bold text-4xl text-left normal-case text-[hsl(var(--background))]">{title}</h1>
        
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </div>);

}