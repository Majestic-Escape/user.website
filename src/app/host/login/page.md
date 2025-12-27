/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from 'react'

import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

import LoginForm from './components/login-form'
import { ArrowRight } from 'lucide-react'


export default function LoginPage() {


  return (
    <div className="min-h-screen font-bricolave grid grid-cols-1 lg:grid-cols-2">
      
      <LoginForm/>
      
      <div className="bg-gradient-to-tr from-primaryGreen to-brightGreen p-6 lg:p-10  flex-col hidden lg:flex">
     

        <h1 className="text-3xl font-bricolage lg:text-3xl font-medium text-white mb-12">
          Sign in to your host account<br />
        </h1>

        <Card className="bg-white p-6 mb-8">
          <CardContent className="p-0">
            <h2 className="font-medium mb-4 bg-green-50 border border-green-500 px-6 py-1 inline-block rounded-3xl">Go Live with Majestic Escape</h2>
            <h1 className="text-4xl font-bricolage">
              Become a registered host on Majestic Escape at<span className="text-green-600 font-bold"> 99₹ </span> only
            </h1>
          </CardContent>
        </Card>

        <div className="overflow-hidden">
         
        <div className="bg-white p-3 rounded-lg w-full hover:shadow-lg transition-shadow duration-200 cursor-pointer">
      <div className="p-6">
        <div className="flex flex-col gap-4">
          <h3 className="text-2xl font-semibold font-bricolage text-gray-900 ">Rules & Regulations for Goa</h3>
          
          <p className="text-gray-600">
            Essential guidelines for tourists visiting Goa, including beach safety, local customs, transportation rules, and environmental regulations.
          </p>
          
          <a 
            href="/rules-for-goa" 
            className="flex items-center text-brightGreen hover:text-primaryGreen font-medium"
          >
            Learn more about Goa's rules
            <ArrowRight className="ml-2 h-4 w-4" />
          </a>
        </div>
      </div>
    </div>

        </div>
      </div>
    </div>
  )
}

