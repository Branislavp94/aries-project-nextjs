import React from 'react'

const SceletonLoading = () => {
  return (
    <div>
      <div className='flex items-center justify-center min-h-screen'>
        <button disabled type="button" className="bg-indigo-400 h-max w-max rounded-lg text-white font-bold hover:bg-indigo-300 hover:cursor-not-allowed">
          <div className="flex items-center justify-center m-[10px]">
            <div className="h-5 w-5 border-t-transparent border-solid animate-spin rounded-full border-white border-4"></div>
            <div className="ml-2"> Processing... </div>
          </div>
        </button>
      </div>
    </div>
  )
}

export default SceletonLoading