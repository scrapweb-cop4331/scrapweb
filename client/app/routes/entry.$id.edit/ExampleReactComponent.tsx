import React, { useState } from 'react';

const EditableTextBox = () => {
  const [text, setText] = useState("Click here to start typing...");

  return (
    <div className="w-full max-w-md p-4">
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Entry Description
      </label>
      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        className="w-full min-h-[150px] p-3 text-gray-800 bg-white border-2 border-gray-300 rounded-lg shadow-sm transition-all duration-200 ease-in-out focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:outline-none hover:border-gray-400 resize-y"
        placeholder="Enter your text..."
      />
      <div className="mt-2 text-xs text-right text-gray-500">
        {text.length} characters
      </div>
    </div>
  );
};

export default EditableTextBox;