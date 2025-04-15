'use client'
import Image from 'next/image';
import React, { useContext, useState } from 'react';
import { FaImage } from "react-icons/fa6";
import { IoIosSend } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { MessageContext } from '../Context/MessageContext';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import axios from "axios";
import { NotifyContext } from '../Context/NotifyContext';
const ChatInput = () => {
  const [images, setImages] = useState([]);
  const [message, setMessage] = useState('');
  // const { AddNewMessage } = useContext(MessageContext);
  const {selectedUser , AddNewMessage} = useContext(MessageContext)
  const {AddNotify} = useContext(NotifyContext)
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImages((prev) => [...prev, ...files]);
  };

  const handleRemoveImage = (index) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };
  const handleAddNew = async () => {
    AddNewMessage(message, images);
    setMessage('');
    setTimeout(() => {
      setImages([]);
    }, 2000);
    AddNotify(message)
  }
  return (
    <>
      {images.length > 0 && (
        <div className="fixed inset-0 z-50 flex flex-col justify-center items-center px-4">
          <div className="relative w-full max-w-2xl p-4 rounded-lg shadow-lg">
            <button
              onClick={() => setImages([])}
              className="absolute top-2 right-2 text-white hover:text-red-500"
            >
              <IoMdClose size={24} />
            </button>
            <div className="mb-4 grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto">
              {images.map((img, index) => (
                <div key={index} className="relative">
                  <Image
                    src={URL.createObjectURL(img)}
                    alt={`preview-${index}`}
                    width={200}
                    height={200}
                    className="rounded-md w-full object-contain"
                  />
                  <button
                    onClick={() => handleRemoveImage(index)}
                    className="absolute top-1 right-1 bg-black bg-opacity-50 text-white rounded-full p-1 hover:text-red-500"
                  >
                    <IoMdClose size={16} />
                  </button>
                </div>
              ))}
            </div>
            <input
              onChange={(e) => setMessage(e.target.value)}
              value={message}
              type="text"
              placeholder="Add a message..."
              className="w-full p-2 mb-4 text-text bg-transparent rounded-md outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleAddNew}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-md transition"
            >
              Send
            </button>
          </div>
        </div>
      )}

      <div className='border-t w-full border-gray-300 p-3 flex items-center'>
        <input
          onChange={(e) => setMessage(e.target.value)}
          value={message}
          type='text'
          placeholder='Type a message...'
          className='flex-1 pl-4 bg-transparent p-2 rounded-full focus:outline-none focus:ring-2 text-text outline-none border border-white focus:ring-blue-500'
        />
        <div className='flex items-center gap-3 ml-3'>
          <div>
            <input
              id="image"
              type="file"
              className='hidden'
              accept="image/*"
              multiple
              onChange={handleImageChange}
            />
            <label htmlFor="image">
              <FaImage className='text-xl text-gray-500 cursor-pointer hover:text-blue-500' />
            </label>
          </div>
          <IoIosSend
            onClick={handleAddNew}
            className='text-xl text-blue-500 cursor-pointer hover:text-blue-700'
          />
        </div>
      </div>
    </>
  );
};

export default ChatInput;
