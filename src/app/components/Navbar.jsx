import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Logo from '../../../public/Inoac.png'


function Navbar() {
  return (
    <div className='shadow-xl'>
      <div className="container mx-auto">
        <div className="flex justify-between items-center p-4">
          <div>
            <Link href="/">
              <Image src={Logo} 
              width={100} height={100} 
              alt='Inoac Logo' 
              style={{ width: 'auto', height: 'auto' }}></Image>
            </Link>
          </div>
          <ul className='flex'>
              <li className='mx-3 hover:underline'><Link href="/login">Login</Link></li>
              <li className='mx-3 hover:underline'><Link href="/register">Register</Link></li>
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Navbar
