import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-gray-200 bg-cover bg-center bg-no-repeat">
        <div className="p-4 my-2 ml-60">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;