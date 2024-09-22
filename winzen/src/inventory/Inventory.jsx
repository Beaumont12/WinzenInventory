import React from 'react'
import { Outlet } from 'react-router-dom';

const Inventory = () => {
  return (
    <div className='bg-[#F9F9F9]'>
      <Outlet className='bg-[#F9F9F9]' />
    </div>
  )
}

export default Inventory;