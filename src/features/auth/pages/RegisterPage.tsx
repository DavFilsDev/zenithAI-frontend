import { useForm, useWatch } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../model/useRegister';
import { notify } from '../../../shared/ui/notify';
import { Input } from '../../../shared/ui/Input';
import { Button } from '../../../shared/ui/Button';
import { CardHeader } from '../../../shared/ui/CardHeader';
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
    <div className="flex min-h-screen items-center justify-center bg-[rgb(var(--color-bg))] px-4">
      <div className="w-full max-w-md space-y-6 rounded-2xl border border-white/20 bg-white/10 p-8 shadow-xl backdrop-blur-md dark:border-white/10 dark:bg-white/5">
        <CardHeader phrase="Create your account and join the most advanced AI coding platform!" />

        <form
          onSubmit={(event) => {
            void handleSubmit(onSubmit)(event);
          }}
          className="mt-6 space-y-4"
        >
          <Input
            label="Email"
            type="email"
            placeholder="Enter your email"
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
            placeholder="Choose a username"
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
            placeholder="Enter your password"
            registration={register('password', {
              required: 'Password is required',
              minLength: { value: 6, message: 'Password must be at least 6 characters' },
            })}
            error={errors.password?.message}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="Confirm your password"
            registration={register('password2', {
              required: 'Please confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            })}
            error={errors.password2?.message}
          />

          <Button type="submit" loading={registerUser.isPending}>
            Sign Up
          </Button>

          <p className="mt-4 text-center text-sm opacity-70">
            Already have an account?{' '}
            <Link
              to="/login"
              className="relative font-medium text-[rgb(var(--color-primary))] after:absolute after:-bottom-0.5 after:left-0 after:h-[1px] after:w-0 after:bg-[rgb(var(--color-primary))] after:transition-all after:duration-300 hover:after:w-full"
            >
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};
