'use client'
import Image from 'next/image'
import React, { useContext } from 'react'
import AriesImage from '@/public/images/SvgHeart.Com-445.png'
import { useForm } from 'react-hook-form'
import InputForm from '../uttils/InputForm'
import { isDateNotBetweenMarch21AndApril19 } from '../helpers'
import { notifyNotAries, successMesasge } from '@/lib/reactTostifyMessage'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import LoadingOverlay from './LoadingOverlay'
import { AuthErrorContext } from '../context/ErrorMessageFormContext'
import ShowErrorMessage from '../uttils/ShowErrorMessage'
import Link from 'next/link'
import { signIn } from "next-auth/react"
import { useRouter } from 'next/navigation';


const LoginUser = () => {
  const { errorMessage, setErrorMessage } = useContext(AuthErrorContext);
  const { handleSubmit, register } = useForm();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => {
      return axios.post(`${process.env.BACKEND_URL}/api/user/login`, data)
    },
    onSuccess({ data }) {
      setErrorMessage(null);
      signIn(
        'credentials',
        {
          redirect: false,
          email: data.email,
        }
      ).then((response) => {
        if (response?.ok) {
          successMesasge('Successfully Login');
          router.push('/dashboard')
        }
      })
    },
    onError(error) {
      setErrorMessage(error.response.data.message)
    }
  },
  )

  const submitForm = (data: any) => {
    const date = data?.date;

    if (isDateNotBetweenMarch21AndApril19(date)) {
      setErrorMessage(null);
      notifyNotAries();
    } else {
      mutate(data)
    }
  }

  return (
    <>
      {isPending && <LoadingOverlay />}
      <section className="bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
          <div className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white gap-2">
            <span>Aries Power</span>
            <Image
              src={AriesImage}
              width={40}
              height={40}
              alt={'Image'}
              objectFit={'contain'}
            />
          </div>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Login to account
              </h1>
              <form className="space-y-4 md:space-y-6" onSubmit={handleSubmit(submitForm)}>
                <InputForm
                  labelName='Email'
                  input={
                    <input
                      type='email'
                      className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                      {...register('email', {
                        required: false
                      })}
                    />
                  }
                />
                <InputForm
                  labelName='Password'
                  input={
                    <input
                      type='text'
                      className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                      {...register('password', {
                        required: false
                      })}
                    />
                  }
                />
                {errorMessage && <ShowErrorMessage errorMessage={errorMessage} />}
                <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 border">Login</button>
                <Link href='/register'>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-4">
                    Dont have an account? <span className="font-medium text-primary-600 hover:underline dark:text-primary-500">Register here</span>
                  </p>
                </Link>
              </form>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}

export default LoginUser