"use client"
import type { Product } from "@/types"

export default function ProductCard({ product, onClick }: { product: Product; onClick: () => void }) {
  return (
    <div
      className="relative overflow-hidden rounded-xl backdrop-blur-xl bg-white/15 border border-white/30 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group"
      onClick={onClick}
    >
      {/* Enhanced light reflection effect */}
      <div className="absolute -inset-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent rotate-45 transform translate-x-[-100%] group-hover:translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
      
      {/* Subtle gradient border */}
      <div className="absolute inset-0 rounded-xl p-[1px] bg-gradient-to-br from-white/40 via-white/25 to-transparent opacity-50"></div>

      <div className="relative z-10 p-5">
        <div className="overflow-hidden rounded-lg mb-5 shadow-sm">
          <img
            src={`http://localhost:8080${product.imagePath}`}
            alt={product.name}
            className="w-full h-52 object-cover transform group-hover:scale-105 transition-transform duration-500"
          />
        </div>

        <div className="space-y-3">
          {/* Improved text layout with better spacing */}
          <h2 className="text-xl font-medium tracking-tight text-gray-800 drop-shadow-sm">
            {product.name}
          </h2>
          
          <div className="flex justify-between items-center">
            <p className="text-gray-700 font-semibold text-lg">
              {product.price} <span className="text-sm font-normal">円</span>
            </p>
            
            <div className="h-6 w-6 rounded-full bg-white/30 backdrop-blur-md flex items-center justify-center group-hover:bg-white/50 transition-colors duration-300">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-700" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          </div>

        </div>
      </div>

      {/* Enhanced hover effect overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
    </div>
  )
}
