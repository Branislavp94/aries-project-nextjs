import React, { useState, useEffect } from 'react';
import { FaImage, FaGift, FaSmile } from 'react-icons/fa';
import EmojiPicker from 'emoji-picker-react'; // Import the emoji picker
import axios from 'axios'; // Import axios for API calls

type ChatInputFormProps = {
  message: string;
  handleTyping: (e: React.ChangeEvent<HTMLInputElement>) => void;
  sendMessage: (e: React.FormEvent) => void;
  handleImageUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleSelectEmoticon: (emoticon: string) => void; // Pass emoticon as argument
  handleSelectGif: (gifUrl: string) => void; // Pass the selected GIF URL to the parent
};

const ChatInputForm = ({
  message,
  handleTyping,
  sendMessage,
  handleImageUpload,
  handleSelectEmoticon,
  handleSelectGif,
}: ChatInputFormProps) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false); // State to manage emoji picker visibility
  const [showGifPicker, setShowGifPicker] = useState(false); // State to manage GIF picker visibility
  const [gifs, setGifs] = useState<string[]>([]); // State to hold GIFs
  const [searchTerm, setSearchTerm] = useState(''); // State to hold the search term

  // Handle emoji selection
  const onEmojiClick = (emojiObject: { emoji: string }) => {
    handleSelectEmoticon(emojiObject.emoji);
    setShowEmojiPicker(false); // Close emoji picker after selecting
  };

  // Fetch GIFs based on search term
  const fetchGifs = async (query: string) => {
    try {
      const response = await axios.get('https://api.giphy.com/v1/gifs/search', {
        params: {
          api_key: process.env.GIPHY_API, // Replace with your Giphy API key
          q: query,
          limit: 10,
        },
      });
      setGifs(response.data.data.map((gif: any) => gif.images.fixed_height.url)); // Adjust based on the API response
    } catch (error) {
      console.error('Error fetching GIFs:', error);
    }
  };

  // Handle GIF picker visibility and fetch GIFs
  const handleGifPickerToggle = () => {
    setShowGifPicker((prev) => !prev); // Toggle GIF picker visibility
    if (!showGifPicker) {
      fetchGifs('https://api.giphy.com/v1/gifs/trending'); // Fetch trending GIFs when opening the picker for the first time
    }
  };

  // Update GIFs based on search term
  useEffect(() => {
    if (showGifPicker) {
      if (searchTerm) {
        fetchGifs(searchTerm); // Fetch GIFs based on the input if there's a search term
      } else {
        fetchGifs('https://api.giphy.com/v1/gifs/trending'); // Fetch trending GIFs if the search term is empty
      }
    }
  }, [searchTerm, showGifPicker]);

  // Handle GIF selection and notify parent
  const onGifSelect = (gifUrl: string) => {
    handleSelectGif(gifUrl); // Pass the selected GIF URL to the parent
    setShowGifPicker(false); // Close GIF picker after selecting
  };


  // Handle image upload
  const onImageUploadChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      handleImageUpload(file); // Pass the selected file to the parent
    }
  };

  return (
    <form onSubmit={sendMessage}>
      <div className="flex flex-row items-center h-16 rounded-xl bg-white w-full px-4">
        <div className="relative flex-grow">
          <input
            type="text"
            className="flex w-full border rounded-xl focus:outline-none focus:border-indigo-300 pl-4 pr-12 h-10"
            value={message}
            onChange={handleTyping}
            placeholder="Type your message..."
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex space-x-4 text-gray-500">
            <label htmlFor="imageUpload" className="cursor-pointer hover:text-gray-700">
              <FaImage size={25} className='transition-transform transform hover:scale-105' />
              <input
                type="file"
                id="imageUpload"
                accept="image/*"
                className="hidden"
                onChange={onImageUploadChange} // Use the new image upload handler
              />
            </label>

            <button type="button" onClick={handleGifPickerToggle} className="cursor-pointer hover:text-gray-700">
              <FaGift size={25} className='transition-transform transform hover:scale-105' />
            </button>

            <button type="button" onClick={() => setShowEmojiPicker((prev) => !prev)} className="cursor-pointer hover:text-gray-700">
              <span role="img" aria-label="emoji">
                <FaSmile size={25} className='transition-transform transform hover:scale-105' />
              </span>
            </button>
          </div>
          {/* Show the emoji picker */}
          {showEmojiPicker && (
            <div className="absolute z-10 bottom-16 right-0">
              <EmojiPicker onEmojiClick={onEmojiClick} />
            </div>
          )}
          {/* Show the GIF picker */}
          {showGifPicker && (
            <div className="absolute z-10 bottom-16 right-0 bg-white p-2 shadow-lg rounded-lg">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search GIFs..."
                className="border rounded-md p-1 mb-2 w-full"
              />
              <div className="grid grid-cols-3 gap-2">
                {gifs.map((gifUrl) => (
                  <img
                    key={gifUrl}
                    src={gifUrl}
                    alt="GIF"
                    className="cursor-pointer h-20 w-20 object-cover"
                    onClick={() => onGifSelect(gifUrl)} // Select GIF on click
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        <button type="submit" className="ml-2 bg-indigo-500 text-white rounded-full px-4 transition-transform transform hover:scale-105">
          Send
        </button>
      </div>
    </form>
  );
};

export default ChatInputForm;
