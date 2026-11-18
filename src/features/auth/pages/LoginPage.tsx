import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useLogin } from '../model/useLogin';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { CardHeader } from '../../../shared/ui/CardHeader';
import { ApiError } from '../../../shared/api/apiError';
import { notify } from '../../../shared/ui/notify';
import { logError } from '../../../shared/lib/logger';

interface LoginForm {
  email: string;
  password: string;
}

export const LoginPage = () => {
  const login = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>();

  const onSubmit = async (data: LoginForm) => {
    try {
      await login.mutateAsync(data);
    } catch (error) {
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
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-canvas px-4 text-text">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <CardHeader phrase="Welcome back to your smart coding companion!" />

        <form
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
          className="space-y-5"
        >
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

          <Button type="submit" loading={login.isPending}>
            Sign In
          </Button>

          <p className="text-center text-sm opacity-70">
            Don’t have an account?{' '}
            <Link
              to="/register"
              className="relative font-medium text-accent-text after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-0 after:bg-accent-text after:transition-all after:duration-300 hover:after:w-full"
            >
              Create one
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
