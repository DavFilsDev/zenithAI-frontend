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
    <div className="min-h-screen flex items-center justify-center bg-[rgb(var(--color-bg))] text-[rgb(var(--color-text))] px-4">
      <div className="max-w-md w-full p-8 space-y-6 bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 rounded-2xl shadow-xl">
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

          <Button type="submit" loading={login.isPending}>
            Sign In
          </Button>

          <p className="text-center text-sm opacity-70">
            Don’t have an account?{' '}
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
