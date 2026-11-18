import { useForm, useWatch } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useRegister } from '../model/useRegister';
import { AuthLayout } from '../components/AuthLayout';
import { notify } from '../../../shared/ui/notify';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { ApiError } from '../../../shared/api/apiError';

interface RegisterForm {
  email: string;
  username: string;
  password: string;
  password2: string;
}

export const RegisterPage = () => {
  const registerUser = useRegister();
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
  } = useForm<RegisterForm>();

  const password = useWatch({ control, name: 'password' });

  const onSubmit = async (data: RegisterForm) => {
    try {
      await registerUser.mutateAsync({
        email: data.email,
        username: data.username,
        password: data.password,
        password2: data.password2,
      });
      notify.success('Account created. Please sign in.');
      void navigate('/login', { replace: true });
    } catch (error) {
      const apiError = error instanceof ApiError ? error : ApiError.fromAxiosError(error);
      const fieldErrors = apiError.getFieldErrors();
      const formFields: Array<keyof RegisterForm> = ['email', 'username', 'password', 'password2'];
      let mapped = false;

      for (const field of formFields) {
        const [message] = fieldErrors[field] ?? [];
        if (message) {
          setError(field, { type: 'server', message });
          mapped = true;
        }
      }

      const unmapped = Object.entries(fieldErrors)
        .filter(([field]) => !formFields.includes(field as keyof RegisterForm))
        .flatMap(([, messages]) => messages);

      const [firstUnmapped] = unmapped;
      if (firstUnmapped) {
        notify.error(firstUnmapped);
      } else if (!mapped) {
        notify.error(apiError.message);
      }
    }
  };

  return (
    <AuthLayout title="Create account">
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
          registration={register('email', {
            required: 'Email is required',
            pattern: {
              value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
              message: 'Invalid email address',
            },
          })}
          error={errors.email?.message}
        />

        <Input
          label="Username"
          type="text"
          autoComplete="username"
          registration={register('username', {
            required: 'Username is required',
            minLength: {
              value: 3,
              message: 'Username must be at least 3 characters',
            },
            maxLength: {
              value: 20,
              message: 'Username must be less than 20 characters',
            },
            pattern: {
              value: /^[a-zA-Z0-9_]+$/,
              message: 'Only letters, numbers, and underscores allowed',
            },
          })}
          error={errors.username?.message}
        />

        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          registration={register('password', {
            required: 'Password is required',
            minLength: { value: 6, message: 'Password must be at least 6 characters' },
          })}
          error={errors.password?.message}
        />

        <Input
          label="Confirm Password"
          type="password"
          autoComplete="new-password"
          registration={register('password2', {
            required: 'Please confirm your password',
            validate: (value) => value === password || 'Passwords do not match',
          })}
          error={errors.password2?.message}
        />

        <Button type="submit" loading={registerUser.isPending} fullWidth>
          Create account
        </Button>

        <p className="text-small text-text-secondary">
          Already have an account?{' '}
          <Link to="/login" className="text-accent-text underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </form>
    </AuthLayout>
  );
};
