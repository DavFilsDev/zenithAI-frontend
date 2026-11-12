import { useForm } from 'react-hook-form';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { useState } from 'react';
import { CardHeader } from '../components/ui/CardHeader';
import { ApiError } from '../services/apiError';
import { notify } from '../lib/notify';
import { logError } from '../lib/logger';

interface LoginForm {
  email: string;
  password: string;
}

export const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      setLoading(true);
      const user = await login(data);

      if (user) {
        notify.success(`Welcome back, ${user.username || user.email}!`);
        navigate('/chat', { replace: true });
      }
    } catch (error: unknown) {
      logError('login', error);
      
      if (error instanceof ApiError) {
        if (error.code === 'unauthorized') {
          notify.error('Invalid email or password. Please try again.');
        } else if (error.code === 'validation_error') {
          notify.error('Invalid request format. Please check your input.');
        } else {
          notify.error(error.message || 'Login failed. Please try again.');
        }
      } else if (error instanceof Error) {
        notify.error(error.message);
      } else {
        notify.error('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center 
                bg-[rgb(var(--color-bg))] 
                text-[rgb(var(--color-text))] 
                px-4">
      {/* Login card */}
      <div className="max-w-md w-full p-8 space-y-6
                bg-white/10 dark:bg-white/5
                backdrop-blur-md
                border border-white/20 dark:border-white/10
                rounded-2xl
                shadow-xl">
        
        <CardHeader phrase="Welcome back to your smart coding companion!" />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
            {...register('email', {
              required: 'Email is required',
              pattern: {
                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                message: 'Invalid email address',
              },
            })}
            error={errors.email?.message}
          />
          
          <Input
            label="Password"
            type="password"
            placeholder="Enter your password"
            {...register('password', { required: 'Password is required' })}
            error={errors.password?.message}
          />
          
          <Button type="submit" loading={loading}>
            Sign In
          </Button>
          
          <p className="text-center text-sm opacity-70">
            Don’t have an account?{" "}
            <Link
              to="/register"
              className="
                font-medium
                text-[rgb(var(--color-primary))]
                relative
                after:absolute after:left-0 after:-bottom-0.5
                after:h-[1px] after:w-0
                after:bg-[rgb(var(--color-primary))]
                after:transition-all after:duration-300
                hover:after:w-full
              "
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};