'use client'
import React, { ReactNode } from 'react'

type Input = {
  labelName?: string;
  input: ReactNode,
};

const InputForm = ({
  labelName = '',
  input,
}: Input) => {
  return (
    <div>
      {labelName && (
        <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">{labelName}</label>
      )}
      {input}

    </div>
  )
}

export default InputForm