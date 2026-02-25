import React from 'react';

/**
 * Flat outline icons (Feather-style) - stroke-based, minimal design.
 * Icons use stroke="currentColor" for a clean flat look.
 */
const ICON_COLORS = {
  people: '#4f46e5',
  person: '#4f46e5',
  bar_chart: '#059669',
  menu_book: '#92400e',
  settings: '#6b7280',
  assignment: '#4338ca',
  pause: '#ea580c',
  event: '#15803d',
  chat: '#0369a1',
  smart_toy: '#7c3aed',
  directions_walk: '#15803d',
  restaurant: '#c2410c',
  fitness_center: '#b91c1c',
  science: '#1d4ed8',
  psychology: '#6b21a8',
  videocam: '#dc2626',
  ac_unit: '#0891b2',
  dollar: '#16a34a',
  calendar: '#15803d',
};

/** Flat outline icons - stroke only, 24x24 */
const FlatIcon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" width="24" height="24" aria-hidden="true">
    {children}
  </svg>
);

const ICONS = {
  people: <FlatIcon><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></FlatIcon>,
  person: <FlatIcon><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></FlatIcon>,
  bar_chart: <FlatIcon><line x1="12" y1="20" x2="12" y2="10" /><line x1="18" y1="20" x2="18" y2="4" /><line x1="6" y1="20" x2="6" y2="16" /></FlatIcon>,
  menu_book: <FlatIcon><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /><line x1="8" y1="6" x2="18" y2="6" /><line x1="8" y1="10" x2="18" y2="10" /></FlatIcon>,
  settings: <FlatIcon><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" /></FlatIcon>,
  assignment: <FlatIcon><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" /><rect x="8" y="2" width="8" height="4" rx="1" ry="1" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></FlatIcon>,
  pause: <FlatIcon><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></FlatIcon>,
  event: <FlatIcon><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></FlatIcon>,
  chat: <FlatIcon><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></FlatIcon>,
  smart_toy: <FlatIcon><rect x="3" y="11" width="18" height="10" rx="2" /><circle cx="12" cy="5" r="2" /><path d="M12 7v4" /><path d="M8 16a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H9a1 1 0 0 1-1-1z" /></FlatIcon>,
  directions_walk: <FlatIcon><circle cx="12" cy="5" r="1" /><path d="m9 20 3-3 2 4 3-4" /><path d="m6 8 2 2 4-4 2 2-3 4" /></FlatIcon>,
  restaurant: <FlatIcon><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></FlatIcon>,
  fitness_center: <FlatIcon><path d="m6.5 6.5 11 11" /><path d="m6.5 17.5 11-11" /><path d="M19 5h-4V1" /><path d="M9 5H5V1" /><path d="M19 19h-4v-4" /><path d="M9 19H5v-4" /></FlatIcon>,
  science: <FlatIcon><path d="M14 14V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v8" /><path d="M14 14H2" /><path d="M22 14h-8" /><path d="M22 14v-4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v4" /></FlatIcon>,
  psychology: <FlatIcon><path d="M12 5a3 3 0 1 0 0 6 3 3 0 0 0 0-6Z" /><path d="M12 13v4" /><path d="M12 20h.01" /><path d="M12 2a10 10 0 0 0-3.5 19.5" /></FlatIcon>,
  videocam: <FlatIcon><path d="m22 8-6 4 6 4V8Z" /><rect x="2" y="6" width="14" height="12" rx="2" ry="2" /></FlatIcon>,
  ac_unit: <FlatIcon><path d="M12 2v4" /><path d="M12 18v4" /><path d="m4.93 4.93 2.83 2.83" /><path d="m16.24 16.24 2.83 2.83" /><path d="M2 12h4" /><path d="M18 12h4" /><path d="m4.93 19.07 2.83-2.83" /><path d="m16.24 7.76 2.83-2.83" /></FlatIcon>,
};

const FallbackIcon = () => <FlatIcon><circle cx="12" cy="12" r="10" /></FlatIcon>;

const DashboardIcon = ({ name, className = '' }) => {
  const Icon = ICONS[name] || <FallbackIcon />;
  const color = ICON_COLORS[name] || 'currentColor';
  return (
    <span
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        color,
      }}
    >
      {Icon}
    </span>
  );
};

export default DashboardIcon;
