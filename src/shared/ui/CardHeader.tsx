import { Link } from 'react-router-dom';

interface CardHeaderProps {
  phrase: string;
}

export const CardHeader = ({ phrase }: CardHeaderProps) => {
  return (
    <div className="mb-4 text-center">
      <Link to="/">
        <h1 className="cursor-pointer text-3xl font-bold tracking-wide">
          Zenith<span className="text-[rgb(var(--color-primary))]">AI</span>
        </h1>
      </Link>
      <p className="mt-1 text-sm text-gray-500 dark:text-gray-100">{phrase}</p>
    </div>
  );
};
