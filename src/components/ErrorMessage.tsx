import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md max-w-md w-full">
        <div className="flex items-center space-x-3 text-red-600 mb-4">
          <AlertCircle className="w-6 h-6" />
          <h2 className="text-xl font-semibold">Configuration Error</h2>
        </div>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export default ErrorMessage;