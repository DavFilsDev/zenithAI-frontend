import { Link } from 'react-router-dom';

interface CardHeaderProps {
  phrase: string;
}

export const CardHeader = ({ phrase }: CardHeaderProps) => {
  return (
    <div className="text-center mb-4">
      <Link to="/">
        <h1 className="text-3xl font-bold tracking-wide cursor-pointer">
          Zenith<span className="text-[rgb(var(--color-primary))]">AI</span>
        </h1>
      </Link>
      <p className="text-sm mt-1 text-gray-500 dark:text-gray-100">{phrase}</p>
    </div>
  );
};
