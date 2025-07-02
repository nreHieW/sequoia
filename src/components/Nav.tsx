import React from 'react'
import { Apple, House, MoonStar, TreePine } from 'lucide-react'
import Link from 'next/link'

export type NavType = 'home' | 'sleep' | 'habits' | 'food'

const navItems: {id: NavType, icon: React.ReactNode, href: string}[] = [
  {
    id: 'home',
    icon: <House />,
    href: '/'
  },
  {
    id: 'sleep',
    icon: <MoonStar />,
    href: '/sleep'
  },
  {
    id: 'habits',
    icon: <TreePine />,
    href: '/habits'
  },
  {
    id: 'food',
    icon: <Apple />,
    href: '/food'
  }
]

export const Nav = () => {
  return (
    <nav className='bottom-0 fixed w-full'>
      <div className='flex items-center justify-between px-10 py-3 bg-white border-t'>
        {navItems.map((item) => (
          <div key={item.id} >
            <Link href={item.href}>
              {item.icon}
            </Link>
          </div>
        ))}
      </div>
    </nav>
  )
}
