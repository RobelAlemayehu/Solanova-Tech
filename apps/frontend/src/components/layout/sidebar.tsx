'use client';

   import React from 'react';
   import Link from 'next/link';
   import { useAuth } from '@/hooks/use-auth';

   export default function Sidebar() {
     const { user, logout } = useAuth();

     if (!user) return null;

     return (
       <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between">
         <div className="p-6">
           <div className="mb-8">
             <h1 className="text-xl font-bold text-indigo-600">PropList</h1>
             <p className="text-xs text-gray-500 mt-1 truncate">{user.email}</p>
             <span className="inline-block mt-2 px-2 py-0.5 bg-indigo-50 text-indigo-700 text-xs font-semibold rounded uppercase">
               {user.role}
             </span>
           </div>

           <nav className="space-y-1">
             {user.role === 'user' && (
               <>
                 <Link
                   href="/"
                   className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded"
                 >
                   Browse Properties
                 </Link>
                 <Link
                   href="/dashboard/user/favorites"
                   className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded"
                 >
                   My Favorites
                 </Link>
               </>
             )}

             {user.role === 'owner' && (
               <>
                 <Link
                   href="/"
                   className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded"
                 >
                   Browse Properties
                 </Link>
                 <Link
                   href="/dashboard/owner/properties"
                   className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded"
                 >
                   My Properties
                 </Link>
                 <Link
                   href="/dashboard/owner/add"
                   className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded"
                 >
                   Add Property
                 </Link>
               </>
             )}

             {user.role === 'admin' && (
               <>
                 <Link
                   href="/dashboard/admin/properties"
                   className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded"
                 >
                   All Properties
                 </Link>
                 <Link
                   href="/dashboard/admin/metrics"
                   className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-gray-900 rounded"
                 >
                   Metrics
                 </Link>
               </>
             )}
           </nav>
         </div>

         <div className="p-6 border-t border-gray-200">
           <button
             onClick={logout}
             className="w-full text-left px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded"
           >
             Log out
           </button>
         </div>
       </aside>
     );
   }
