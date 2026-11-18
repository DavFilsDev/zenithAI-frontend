import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { useLogin } from '../model/useLogin';
import { AuthLayout } from '../components/AuthLayout';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
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
    <AuthLayout title="Sign in">
      <form
        onSubmit={(event) => {
          void handleSubmit(onSubmit)(event);
        }}
        className="space-y-4"
      >
        <Input
          label="Email"
          type="email"
          autoComplete="email"
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
          autoComplete="current-password"
          {...register('password', { required: 'Password is required' })}
          error={errors.password?.message}
        />

        <Button type="submit" loading={login.isPending} fullWidth>
          Sign in
        </Button>

        <p className="text-small text-text-secondary">
          Don&apos;t have an account?{' '}
          <Link to="/register" className="text-accent-text underline underline-offset-2">
            Create an account
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
