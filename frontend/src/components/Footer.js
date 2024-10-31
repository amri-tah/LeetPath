import React from 'react'

const Footer = () => {
  return (
    <div>
      <footer className="bg-black text-gray-400 py-6">
        <div className="container mx-auto text-center">
          <p>&copy; {new Date().getFullYear()} LeetPath. All rights reserved.</p>
          <div className="space-x-4 mt-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Service</a>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Footer
