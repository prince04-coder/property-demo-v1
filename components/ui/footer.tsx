// // import React from "react";
// // import Link from "next/link";
// // import { Building } from "lucide-react";

// // export function Footer() {
// //   const currentYear = new Date().getFullYear();

// //   return (
// //     <footer className="border-t border-t-slate-200 dark:border-t-slate-800 mt-auto">
// //       <div className="container mx-auto px-4 py-6">
// //         {/* Divider */}
// //         {/* <div className="h-px bg-slate-200 dark:bg-slate-800 my-6"></div> */}

// //         {/* Copyright */}
// //         <div className="flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
// //           <p>© {currentYear} Property Dashboard. All rights reserved.</p>
// //           <div className="flex space-x-4 mt-4 md:mt-0">
// //             <a href="#" className="hover:text-foreground">
// //               Privacy
// //             </a>
// //             <a href="#" className="hover:text-foreground">
// //               Terms
// //             </a>
// //             <a href="#" className="hover:text-foreground">
// //               Cookies
// //             </a>
// //           </div>
// //         </div>
// //       </div>
// //     </footer>
// //   );
// // }
// import React from "react";

// export function Footer() {
//   const currentYear = new Date().getFullYear();

//   return (
//     <footer className="border-t border-t-slate-200 dark:border-t-slate-800 mt-auto">
//       <div className="container mx-auto px-4 py-6">
//         <div className="flex flex-col  items-center text-sm text-muted-foreground">
//           <p className="text-center">
//             © {currentYear} DC Office, Hamirpur, Himachal Pradesh. All rights
//             reserved.
//           </p>

//           {/* <div className="flex space-x-4 mt-4 md:mt-0">
//             <a href="#" className="hover:text-foreground">
//               Privacy Policy
//             </a>
//             <a href="#" className="hover:text-foreground">
//               Terms of Use
//             </a>
//             <a href="#" className="hover:text-foreground">
//               Contact
//             </a>
//           </div> */}
//         </div>

//         <div className="text-xs text-center mt-4 text-muted-foreground">
//           Developed by Virendra & Prince
//         </div>
//       </div>
//     </footer>
//   );
// }
import React from "react";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-t-slate-200 dark:border-t-slate-800 mt-auto">
      <div className="container mx-auto px-4 py-3">
        <div className="flex flex-col items-center text-xs text-muted-foreground">
          <p className="text-center">
            © {currentYear} DC Office, Hamirpur, Himachal Pradesh. All rights
            reserved.
          </p>
        </div>

        <div className="text-[11px] text-center mt-2 text-muted-foreground">
          Developed by Virendra & Prince
        </div>
      </div>
    </footer>
  );
}
