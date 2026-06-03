import React from 'react';

export default function DataTicker({ totalTools, categories }) {
  const newToday = Math.min(3, totalTools);
  
  const tickerContent = `INDEXING ${totalTools} TOOLS  ◆  ${Object.keys(categories).length} CATEGORIES ACTIVE  ◆  ${newToday} NEW TODAY  ◆  SYSTEM STATUS: OPTIMAL  ◆  LATENCY: 12ms  ◆  UPTIME: 99.97%  ◆  `;

  return (
    <div className="h-7 custom-data-ticker overflow-hidden flex items-center">
      <div className="ticker-scroll whitespace-nowrap flex">
        <span className="text-[10px] font-mono tracking-[0.1em] px-4">
          {tickerContent}{tickerContent}
        </span>
      </div>
    </div>
  );
}