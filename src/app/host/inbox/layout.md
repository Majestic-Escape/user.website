"use client" 

import { Button } from "@/components/ui/button"

import { usePathname } from "next/navigation"


import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Separator } from "@/components/ui/separator"

import { ArrowLeft, Bell, Headphones, MessageSquare } from "lucide-react"

import { useRouter } from 'next/navigation'
import Link from "next/link"


export default function DashboardLayout({
  children,
}){

  const router = useRouter()


  const pathname = usePathname()
  const routes = pathname.split('/').filter(Boolean)
  const currentRoute = routes[routes.length - 1]
  const displayText = currentRoute.charAt(0).toUpperCase() + currentRoute.slice(1)

  const handleLogout = ()=>{
    localStorage.removeItem('token')
    router.push('/')
  }
  return (
    <>
  
   
        <header className=" w-full z-10 bg-white border-b flex justify-between h-16 py-2 shrink-0 items-center gap-2 transition-[width,height] ease-linear pr-6 group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
          <div className="flex justify-between  items-center gap-2 px-4">
          <Link className="bg-lightGreen/30 text-primaryGreen text-sm py-2 px-3 border" href="/host/dashboard"> <ArrowLeft className="inline-block mr-2 size-4"/> Go Back</Link>  
            <Separator orientation="vertical" className="mr-2 h-4" />
            <Breadcrumb>
              <BreadcrumbList>
                {routes.length > 1 && (
                  <>
                    <BreadcrumbItem className="hidden md:block">
                      <BreadcrumbLink href={`/${routes[0]}`}>
                        {routes[0].charAt(0).toUpperCase() + routes[0].slice(1)}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator className="hidden md:block" />
                  </>
                )}
                <BreadcrumbItem>
                  <BreadcrumbPage href={pathname}>{displayText}</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
            </div>
         
     <div className="hidden md:flex items-center gap-x-2">


   
     
      <Button variant="ghost"  className="hover:text-primaryGreen   text-brightGreen" size="icon">
          <MessageSquare className="w-5 h-5" />
        </Button>
        <Button variant="ghost"  className="hover:text-primaryGreen   text-brightGreen" size="icon">
        <Bell className="w-5 h-5" />
        </Button>
        <Link href="host/help-center"  className="hover:text-primaryGreen   text-brightGreen" size="icon">
        <Headphones className="w-5 h-5" />
        </Link>
        <Separator orientation="vertical" className="mr-2 h-4" />

        <Button className="bg-primaryGreen text-white hover:bg-brightGreen  rounded-full px-6"  onClick={handleLogout}>
        Logout</Button>
       
        </div>
        </header>
        
        <main className="min-h-[100vh] flex-1 rounded-xl bg-muted/50 md:min-h-min" >
            {children}
          </main>
          </>

  )
}
