import React from 'react';

/**
 * Compatibility wrapper for pages.
 * The master layout shell (sidebar, navigation, theme toggle, auth guard)
 * is managed at the router level by DashboardLayout in App.jsx via <Outlet />.
 */
export default function DashboardLayoutPassThrough({ children }) {
  return <div className="w-full">{children}</div>;
}
