import React from 'react';

interface NameFormProps {
  userName: string;
  onNameChange: (name: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const NameForm: React.FC<NameFormProps> = ({ userName, onNameChange, onSubmit }) => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <form onSubmit={onSubmit} className="bg-white p-8 rounded-lg shadow-md">
        <h2 className="text-2xl font-bold mb-4">Enter your name</h2>
        <input
          type="text"
          value={userName}
          onChange={(e) => onNameChange(e.target.value)}
          className="w-full p-2 border rounded mb-4"
          placeholder="Your name"
          required
        />
        <button
          type="submit"
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Join Call
        </button>
      </form>
    </div>
  );
};

export default NameForm;