'use client'
import Image from 'next/image'
import React, { useContext } from 'react'
import LogoImage from '@/public/images/413031207_6745980488864413_7674386761553248927_n.jpg'
import AriesImage from '@/public/images/SvgHeart.Com-445.png'
import { useForm } from 'react-hook-form'
import InputForm from '../uttils/InputForm'
import { isDateNotBetweenMarch21AndApril19, validateForm } from '../helpers'
import { notifyNotAries, successMesasge } from '@/lib/reactTostifyMessage'
import axios from 'axios'
import { useMutation } from '@tanstack/react-query'
import LoadingOverlay from './LoadingOverlay'
import { AuthErrorContext } from '../context/ErrorMessageFormContext'
import ShowErrorMessage from '../uttils/ShowErrorMessage'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

const RegisterUser = () => {
  const { errorMessage, setErrorMessage } = useContext(AuthErrorContext);
  const { handleSubmit, register } = useForm();
  const router = useRouter();

  const { mutate, isPending } = useMutation({
    mutationFn: (data: any) => {
      return axios.post(`${process.env.BACKEND_URL}/api/user/register`, data)
    },
    onSuccess() {
      setErrorMessage(null);
      successMesasge('Successfully user created');
      router.push('/login');
    },
    onError(error) {
      // @ts-ignore
      setErrorMessage(validateForm(error.response.data.message))
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
            <Image
              src={LogoImage}
              width={80}
              height={100}
              alt={'Image'}
            />
            <span>Aries Power</span>
            <Image
              src={AriesImage}
              width={40}
              height={40}
              alt={'Image'}
            />
          </div>
          <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
              <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                Create and account
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
                      type='password'
                      className='bg-gray-50 border border-gray-300 text-gray-900 sm:text-sm rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                      {...register('password', {
                        required: false
                      })}
                    />
                  }
                />

                <div className="relative max-w-sm">
                  <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
                    </svg>
                  </div>
                  <InputForm
                    input={
                      <input
                        type='date'
                        className='bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500'
                        placeholder="Select date"
                        {...register('date', {
                          required: true
                        })}
                      />
                    }
                  />
                </div>
                {errorMessage && <ShowErrorMessage errorMessage={errorMessage} />}
                <button type="submit" className="w-full text-white bg-primary-600 hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800 border">Create an account</button>
                <Link href='/login'>
                  <p className="text-sm font-light text-gray-500 dark:text-gray-400 mt-4">
                    Already have an account? <span className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</span>
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

export default RegisterUser