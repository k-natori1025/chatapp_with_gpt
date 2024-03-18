"use client";

import { signInWithEmailAndPassword } from 'firebase/auth';
import React from 'react'
import { useForm, SubmitHandler } from 'react-hook-form';
import { auth } from '../../../../firebase';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

type Inputs = {
  email: string;
  password: string;
}

const Login = () => {

  const router = useRouter()
  const { 
    register, 
    handleSubmit, 
    formState: {errors}
  } = useForm<Inputs>();

  const onSubmit: SubmitHandler<Inputs> = async (data) => {
    console.log(data)
    await signInWithEmailAndPassword(auth, data.email, data.password)
    .then((userCredential) => {
        const user = userCredential.user;
        router.push("/");
      }
    )
    .catch((error) => {
      console.log(error);
      if(error.code == "auth/invalid-credential") {
        alert("そのようなユーザーは存在しません")
      }
      else {
        alert(error);
      }
    });
  };
  
  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white p-8 rounded-lg shadow-md w-100"
      >
        <h1 className="mb-4 text-2xl text-gray-700 font-medium">ログイン</h1>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Email
          </label>
          <input
            {...register("email", {
              required: "メールアドレスは必須です。",
              pattern: {
                value:
                  /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/,
                message: "不適切なメールアドレスです。",
              },
            })}
            type="text"
            className="mt-1 border-2 rounded-md w-full p-2"
          />
          {errors.email && (
            <span className="text-red-600 text-sm">{errors.email.message}</span>
          )}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-600">
            Password
          </label>
          <input
            type="password"
            {...register("password", {
              required: "パスワードは必須です。",
              minLength: {
                value: 6,
                message: "6文字以上入力してください。",
              },
            })}
            className="mt-1 border-2 rounded-md w-full p-2"
          />
          {errors.password && (
            <span className="text-red-600 text-sm">
              {errors.password.message}
            </span>
          )}
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            className="text-white font-bold py-2 px-4 rounded hover:bg-blue-700"
            style={{ backgroundColor: "#abf061", backgroundImage: "linear-gradient(132deg, #abf061 0%, #2edc6d 50%, #33b913 100%)"}}
          >
            ログイン
          </button>
        </div>
        <div className="mt-4">
          <span className="text-gray-600 text-sm">
            まだ登録していませんか？
          </span>
          <Link
            href={"/auth/register"}
            className="text-blue-500 text-sm font-bold ml-1 hover:text-blue-700"
          >
            新規登録ページへ
          </Link>
        </div>
      </form>
    </div>
  );
}

export default Login
