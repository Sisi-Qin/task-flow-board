/*
 * Copyright 2009-2026 C3 AI (www.c3.ai). All Rights Reserved.
 * Confidential and Proprietary C3 Materials.
 * This material, including without limitation any software, is the confidential trade secret and proprietary
 * information of C3 and its licensors. Reproduction, use and/or distribution of this material in any form is
 * strictly prohibited except as set forth in a written license agreement with C3 and/or its authorized distributors.
 * This material may be covered by one or more patents or pending patent applications.
 */

import React from 'react';
import { Route, Routes } from 'react-router-dom';
import KanbanBoard from './pages/KanbanBoard/KanbanBoard';
import SideNav from './components/SideNav/SideNav';
import ErrorReporterProvider from './components/ErrorBoundary/ErrorBoundary';

export default function App() {
  return (
    <ErrorReporterProvider>
      <div className="h-screen flex max-w-full overflow-hidden">
        <SideNav />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-auto">
            <Routes>
              {/* Add page routes here */}
              <Route path="/" element={<KanbanBoard />} />
              <Route
                path="*"
                element={
                  import.meta.env.MODE === 'development' ? (
                    <div className="flex items-center justify-center h-full p-8 text-center text-secondary">
                      <p>No route matched. Add routes in App.tsx.</p>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center h-full p-8 text-center text-secondary">
                      <p>Page not found.</p>
                    </div>
                  )
                }
              />
            </Routes>
          </main>
        </div>
      </div>
    </ErrorReporterProvider>
  );
}
