import React from 'react'
import { useState } from 'react';
import { Login } from '../Login/Login';
import { SignUp } from '../SignUp/SignUp';
export const LoginSignUp = () => {
const [action, setAction] = useState('Login');
  return (
    <div className='main-container'>
      {action === 'Login' && <Login setAction={setAction} />}
      {action === 'SignUp' && <SignUp setAction={setAction} />}
    </div>
  );
}
