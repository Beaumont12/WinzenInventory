import React from 'react';
import Sidebar from './Sidebar';
import Logo from './assets/images/logo.png';

const Layout = ({ children }) => {
  return (
    <div className="flex h-screen" style={{ backgroundImage: `url(${Logo})`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
      <Sidebar />
      <div className="flex-1 overflow-y-auto bg-white">
        <div className="p-4 my-2 ml-60">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Layout;