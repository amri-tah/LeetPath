import React from 'react'
import Link from 'next/link'

const Navbar = () => {
  return (
    <div className='flex px-10 py-5 text-xl justify-between mx-10 my-5 text-white bg-black rounded-xl top-0 sticky'>
      <h1 className='font-lexend '>{"{LeetPath}"}</h1>
      <div className='flex gap-10 font-montserrat'>
        <h1><Link href='/'>Home</Link></h1>
        <h1><Link href='/login'>Login</Link></h1>
      </div>
    </div>
  )
}

export default Navbar
