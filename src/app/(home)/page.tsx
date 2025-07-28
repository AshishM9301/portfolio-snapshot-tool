import React from 'react'
import { FaCamera, FaLink, FaBars, FaBolt } from 'react-icons/fa'
import { IoFilterOutline } from 'react-icons/io5'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

const HomePage = () => {
  return (
    <div className="min-h-screen bg-white flex justify-center px-4 py-16">
      <Card className="w-full max-w-2xl border-0 shadow-none">
        <CardContent className="p-8 space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-4 mb-32">
            {/* Icon */}
            <div className="flex justify-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaCamera className="w-8 h-8 text-blue-600" />
              </div>
            </div>

            {/* Title */}
            <h1 className="text-4xl font-bold text-gray-900">
              Portfolio Snapshot Tool
            </h1>

            {/* Description */}
            <p className="text-lg text-gray-600 w-2/3 mx-auto">
              Create professional portfolio snapshots in seconds
            </p>
          </div>

          {/* Input Section */}
          <div className="space-y-4">
            <div className='flex items-center gap-4'>

              <div className="relative flex-1">
                <Input
                  type="url"
                  placeholder="Enter portfolio URL..."

                  className="w-full h-12 pl-4 pr-12 text-lg border-gray-200 rounded-full focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center space-x-2">
                  <FaLink className="w-4 h-4 text-gray-400" />
                </div>
              </div>
              <IoFilterOutline className="w-8 h-8 text-gray-400 cursor-pointer hover:text-gray-600" />
            </div>
          </div>

          {/* Action Section */}
          <div className="flex justify-center">
            <Button
              className="w-full max-w-md h-14 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white text-lg font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <FaBolt className="w-5 h-5 mr-2" />
              Generate Snapshot
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default HomePage