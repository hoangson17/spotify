import React, { useState, useEffect } from 'react';
import { InputCustom } from '@/components/InputCustom';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import icons from '../../utils/icons';
import { useDispatch, useSelector } from 'react-redux';
import { login } from '@/stores/actions/authActions';
import { useNavigate } from 'react-router-dom';

const { FaSpotify } = icons;

const Login: React.FC = () => {
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});

  const dispatch = useDispatch<any>();
  const navigate = useNavigate();

  // Lấy state auth từ Redux
  const auth = useSelector((state: any) => state.auth);
  const { user, loading, error } = auth;

  // Redirect khi login thành công
  useEffect(() => {
    if (user) navigate('/');
  }, [user, navigate]);

  // Validate form
  const validate = () => {
    const errs: typeof errors = {};
    if (!loginForm.email) errs.email = 'Email is required';
    if (!loginForm.password) errs.password = 'Password is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLogin = () => {
    if (!validate()) return;
    dispatch(login(loginForm.email, loginForm.password));
  };

  return (
    <div className='bg-black flex flex-col items-center justify-center h-screen'>
      <div className='max-w-[400px] flex items-center flex-col gap-2'>
        <FaSpotify fontSize={38} className="text-white" />
        <h1 className='text-[50px] text-white font-[700]'>WelComeback</h1>

        <div className='flex flex-col gap-4 w-full'>
          <InputCustom
            label='Email or username'
            name='email'
            value={loginForm.email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLoginForm({ ...loginForm, email: e.target.value })
            }
            className='w-full'
          />
          {errors.email && <p className='text-red-500 text-sm'>{errors.email}</p>}

          <InputCustom
            label='Password'
            name='password'
            type='password'
            value={loginForm.password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setLoginForm({ ...loginForm, password: e.target.value })
            }
            className='w-full'
          />
          {errors.password && <p className='text-red-500 text-sm'>{errors.password}</p>}

          {error && <p className='text-red-500 text-center'>{error}</p>}

          <Button
            onClick={handleLogin}
            className='bg-[#1DB954] hover:bg-[#1ED760] hover:scale-102 text-black font-semibold'
            disabled={loading}
          >
            {loading ? 'Logging in...' : 'Continue'}
          </Button>

          <div className='text-center'>
            <p className='text-white font-bold'>or</p>
          </div>

          <a
            href={`${import.meta.env.VITE_SERVER_API}/auth/google/redirect`}
            className='flex items-center justify-center gap-2 hover:scale-102 text-white font-semibold border border-white rounded-md py-2 transition-transform'
          >
            <FcGoogle size={25} />
            Continue with Google
          </a>

          <div className='flex items-center gap-2 flex-col text-center'>
            <p className='text-[#8c8b8b] font-bold'>Don't have an account?</p>
            <a href={'/register'} className='bg-[#ffffff00] hover:scale-110 text-lg text-white font-semibold'>
              Sign up
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
