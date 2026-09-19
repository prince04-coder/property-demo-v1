import React from 'react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-t-slate-400 dark:border-t-slate-800 mt-auto">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col items-center text-xs text-muted-foreground">
          <p className="text-center">
            © {currentYear} DC Office, Hamirpur, Himachal Pradesh. All rights reserved.
          </p>
        </div>

        <div className="text-[11px] text-center mt-2 text-muted-foreground">
          Developed by Virendra & Prince
        </div>
      </div>
    </footer>
  );
}
