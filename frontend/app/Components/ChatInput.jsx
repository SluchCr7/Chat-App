'use client';

import React, { useContext, useState, useEffect, useRef , useCallback } from 'react';
import { 
  FaImage, FaPaperclip, FaSmile, FaMicrophone, FaReply, 
  FaTrashAlt, FaStop, FaPlay, FaPause 
} from "react-icons/fa";
import { IoIosSend } from "react-icons/io";
import { IoMdClose } from "react-icons/io";
import { MessageContext } from '../Context/MessageContext';
import { AuthContext } from '../Context/AuthContext';
import { ThemeContext } from '../Context/ThemeContext';
import dynamic from 'next/dynamic';
import { toast } from 'react-toastify';
import axios from 'axios';

// Lazy load Emoji Picker to prevent SSR window reference errors
const EmojiPicker = dynamic(
  () => import('emoji-picker-react'),
  { ssr: false }
);

const ChatInput = () => {
  const { 
    selectedUser, 
    selectedGroup, 
    selectedChannel, 
    AddNewMessage,
    directChats,
    groupChats,
    handleSaveDraft,
    replyMessage,
    setReplyMessage
  } = useContext(MessageContext);
  
  const { socket, authUser } = useContext(AuthContext);
  const themeContext = useContext(ThemeContext);
  const theme = themeContext ? themeContext.theme : 'black';

  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  
  const typingTimeoutRef = useRef(null);
  const draftSaveTimeoutRef = useRef(null);
  const inputRef = useRef(null);

  const targetId = selectedUser?._id || selectedGroup?._id || selectedChannel?._id;
  const type = selectedUser ? "direct" : selectedGroup ? "group" : "channel";

  // Emoji states
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [recentEmojis, setRecentEmojis] = useState([]);
  const emojiPickerRef = useRef(null);

  // Voice recording states
  const [recordingState, setRecordingState] = useState('idle'); // 'idle', 'recording', 'preview'
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [previewPlaying, setPreviewPlaying] = useState(false);

  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioContextRef = useRef(null);
  const analyserRef = useRef(null);
  const animationFrameRef = useRef(null);
  const canvasRef = useRef(null);
  const previewAudioRef = useRef(null);

  // Voice recording helpers (declared early to prevent temporal dead zone reference errors in useEffect)
  const cleanupRecordingResources = useCallback((stopTracks = true) => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (audioContextRef.current) {
      if (audioContextRef.current.state !== 'closed') {
        audioContextRef.current.close();
      }
      audioContextRef.current = null;
    }
    if (stopTracks && streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupRecordingResources(true);
    setAudioBlob(null);
    setAudioUrl('');
    setRecordingState('idle');
  }, [cleanupRecordingResources]);

  // --- 1. Populate drafts on selection change ---
  useEffect(() => {
    setMessage('');
    setReplyMessage(null); // Clear reply when chat changes
    
    // Discard any active recording if user switches chats
    cancelRecording();

    if (!targetId) return;

    if (type === "group") {
      const activeGrp = groupChats.find(g => g._id === targetId);
      if (activeGrp?.draft) setMessage(activeGrp.draft);
    } else {
      const activeDM = directChats.find(c => c.recipient?._id === targetId || c._id === targetId);
      if (activeDM?.draft) setMessage(activeDM.draft);
    }
  }, [selectedUser, selectedGroup, selectedChannel, directChats, groupChats, setReplyMessage, targetId, type, cancelRecording]);

  // --- 2. Save draft automatically with debounce ---
  const triggerDraftSave = (text) => {
    if (!targetId) return;

    if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);

    draftSaveTimeoutRef.current = setTimeout(async () => {
      let chatId = targetId;
      if (type === "direct") {
        const activeDM = directChats.find(c => c.recipient?._id === targetId);
        if (activeDM) chatId = activeDM._id;
        else return; // If conversation is not created yet, no draft is saved on server
      }
      await handleSaveDraft(chatId, type, text);
    }, 1000); // 1-second debounce
  };

  // --- 3. Real-time Typing Handlers ---
  const handleInputChange = (e) => {
    const val = e.target.value;
    setMessage(val);
    triggerDraftSave(val);
    
    if (!socket || !targetId) return;

    if (!isTyping) {
      setIsTyping(true);
      socket.emit("typingStart", { targetId, type, senderName: authUser?.username });
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("typingStop", { targetId, type });
    }, 2000);
  };

  // --- 4. Emoji Actions ---
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('recent_emojis') || '[]');
      setRecentEmojis(saved.slice(0, 5));
    } catch (e) {
      console.error(e);
    }
  }, [showEmojiPicker]);

  const saveRecentEmoji = (emoji) => {
    try {
      const recent = JSON.parse(localStorage.getItem('recent_emojis') || '[]');
      const filtered = recent.filter(e => e !== emoji);
      const updated = [emoji, ...filtered].slice(0, 20);
      localStorage.setItem('recent_emojis', JSON.stringify(updated));
      setRecentEmojis(updated.slice(0, 5));
    } catch (e) {
      console.error("Error saving recent emoji", e);
    }
  };

  const onEmojiClick = (emojiData) => {
    const emoji = emojiData.emoji;
    if (!emoji) return;

    saveRecentEmoji(emoji);

    const input = inputRef.current;
    if (input) {
      const start = input.selectionStart || 0;
      const end = input.selectionEnd || 0;
      const text = input.value;
      const before = text.substring(0, start);
      const after = text.substring(end);
      
      const newText = before + emoji + after;
      setMessage(newText);
      triggerDraftSave(newText);

      const newCursorPos = start + emoji.length;
      
      setTimeout(() => {
        input.focus();
        input.setSelectionRange(newCursorPos, newCursorPos);
      }, 10);
    } else {
      setMessage((prev) => prev + emoji);
    }
  };

  // --- 5. Voice Recording Actions ---
  const startRecording = async () => {
    try {
      // Close emoji picker if open
      setShowEmojiPicker(false);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };
      
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/webm;codecs=opus' });
        setAudioBlob(blob);
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
      };
      
      mediaRecorder.start();
      setRecordingState('recording');
      setRecordingTime(0);
      
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
      
      setupAudioVisualizer(stream);
    } catch (err) {
      console.error("Microphone access error:", err);
      toast.error("Microphone permission denied or not available. Please allow access.");
    }
  };

  const setupAudioVisualizer = (stream) => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioContext = new AudioContext();
      audioContextRef.current = audioContext;

      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 64;
      analyserRef.current = analyser;
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const draw = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        animationFrameRef.current = requestAnimationFrame(draw);
        analyser.getByteFrequencyData(dataArray);

        ctx.clearRect(0, 0, width, height);

        const barWidth = 3;
        const barGap = 3.5;
        const totalBars = Math.floor(width / (barWidth + barGap));
        
        ctx.fillStyle = '#10b981'; // Premium Emerald / WhatsApp green visualizer color

        for (let i = 0; i < totalBars; i++) {
          const dataIdx = i % bufferLength;
          const val = dataArray[dataIdx] || 0;
          const barHeight = Math.max(4, (val / 255) * height);
          const x = i * (barWidth + barGap);
          const y = (height - barHeight) / 2;

          if (ctx.roundRect) {
            ctx.beginPath();
            ctx.roundRect(x, y, barWidth, barHeight, 1.5);
            ctx.fill();
          } else {
            ctx.fillRect(x, y, barWidth, barHeight);
          }
        }
      };

      draw();
    } catch (e) {
      console.error("Failed to setup visualizer:", e);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    cleanupRecordingResources(false);
    setRecordingState('preview');
  };

  const sendVoiceMessage = async () => {
    if (!audioBlob || isUploading) return;
    setIsUploading(true);

    try {
      const token = localStorage.getItem("userToken") || authUser?.token;
      
      const formData = new FormData();
      formData.append('audio', audioBlob, `voice-note-${Date.now()}.webm`);

      // Upload audio blob to API
      const uploadRes = await axios.post(
        `${process.env.NEXT_PUBLIC_SOCKET_URL}/api/messages/upload-audio`,
        formData,
        {
          headers: {
            authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      const { url, fileSize } = uploadRes.data;

      // Pass voice metadata to AddNewMessage context helper
      await AddNewMessage('', [], null, {
        url,
        duration: recordingTime,
        fileSize
      });

      // Clear states
      setAudioBlob(null);
      setAudioUrl('');
      setRecordingState('idle');
    } catch (err) {
      console.error("Failed to upload voice message:", err);
      toast.error("Failed to send voice message. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const togglePreviewPlayback = () => {
    if (!audioUrl) return;

    if (!previewAudioRef.current) {
      const audio = new Audio(audioUrl);
      previewAudioRef.current = audio;
      audio.addEventListener('ended', () => setPreviewPlaying(false));
    }

    if (previewPlaying) {
      previewAudioRef.current.pause();
      setPreviewPlaying(false);
    } else {
      previewAudioRef.current.play().catch(e => console.error(e));
      setPreviewPlaying(true);
    }
  };

  useEffect(() => {
    return () => {
      if (previewAudioRef.current) {
        previewAudioRef.current.pause();
        previewAudioRef.current = null;
      }
      cleanupRecordingResources(true);
    };
  }, [audioUrl, cleanupRecordingResources]);

  // --- 6. File Handler Actions ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File ${file.name} exceeds 10MB limit.`);
        return false;
      }
      return true;
    });

    setAttachments((prev) => [...prev, ...validFiles]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSend = async () => {
    if (!message.trim() && attachments.length === 0) return;

    // Clear typing indicator
    if (socket && targetId) {
      setIsTyping(false);
      socket.emit("typingStop", { targetId, type });
    }

    const replyToId = replyMessage ? replyMessage._id : null;
    await AddNewMessage(message, attachments, replyToId);
    
    // Clear draft
    if (targetId) {
      let chatId = targetId;
      if (type === "direct") {
        const activeDM = directChats.find(c => c.recipient?._id === targetId);
        if (activeDM) chatId = activeDM._id;
      }
      handleSaveDraft(chatId, type, "");
    }

    setMessage('');
    setAttachments([]);
    setReplyMessage(null);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const formatTime = (secs) => {
    if (isNaN(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const pickerTheme = theme === 'white' ? 'light' : 'dark';

  return (
    <div className="border-t border-border p-4 bg-surface flex flex-col space-y-3 relative transition-all duration-300">
      
      {/* Reply Reference Preview Bar */}
      {replyMessage && (
        <div className="flex items-center justify-between p-3 bg-primary/5 border border-primary/20 rounded-xl animate-slide-in">
          <div className="flex items-center gap-2 text-left overflow-hidden">
            <FaReply className="text-primary text-xs flex-shrink-0" />
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">Replying to @{replyMessage.sender?.username || "Friend"}</span>
              <p className="text-xs text-text-secondary truncate italic font-medium">{replyMessage.text || "Media attachment"}</p>
            </div>
          </div>
          <button 
            onClick={() => setReplyMessage(null)}
            className="p-1 rounded-full text-text-muted hover:text-rose-500 hover:bg-surface-hover transition-all duration-300"
            title="Cancel Reply"
          >
            <IoMdClose size={16} />
          </button>
        </div>
      )}

      {/* File Previews Panel */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-3 p-3 bg-bg-primary border border-border rounded-xl max-h-32 overflow-y-auto">
          {attachments.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            return (
              <div key={index} className="relative flex items-center gap-2.5 p-2 bg-surface rounded-lg border border-border pr-8 animate-fade-in">
                {isImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="preview" 
                    className="w-10 h-10 object-cover rounded border border-border" 
                  />
                ) : (
                  <FaPaperclip className="text-primary text-sm" />
                )}
                <div className="flex flex-col max-w-[120px] text-left">
                  <span className="text-[10px] font-bold text-text-primary truncate">{file.name}</span>
                  <span className="text-[8px] text-text-muted font-bold">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button 
                  onClick={() => handleRemoveAttachment(index)}
                  className="absolute right-1 top-1/2 -translate-y-1/2 text-text-muted hover:text-rose-500 transition-all duration-300"
                >
                  <IoMdClose size={16} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Emoji Picker Popover */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef} 
          className="absolute bottom-20 left-4 z-50 shadow-2xl animate-fade-in w-[320px] sm:w-[350px] max-w-[90vw]"
        >
          <EmojiPicker 
            theme={pickerTheme}
            onEmojiClick={onEmojiClick}
            width="100%"
            height={360}
            skinTonesDisabled={false}
            searchDisabled={false}
            previewConfig={{ showPreview: false }}
          />
        </div>
      )}

      {/* Redesigned Premium Layout Input Row */}
      <div className="flex items-center gap-2.5 w-full">
        {recordingState === 'idle' ? (
          <>
            {/* Attachment buttons */}
            <div className="flex items-center gap-1.5">
              <input 
                type="file"
                id="file-attachment"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label 
                htmlFor="file-attachment"
                className="w-10 h-10 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border hover:border-border-hover text-text-secondary hover:text-text-primary shadow-sm transition-all duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                title="Attach Files"
              >
                <FaPaperclip className="text-sm" />
              </label>

              <input 
                type="file"
                id="image-attachment"
                accept="image/*"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label 
                htmlFor="image-attachment"
                className="w-10 h-10 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border hover:border-border-hover text-text-secondary hover:text-text-primary shadow-sm transition-all duration-300 cursor-pointer flex items-center justify-center hover:scale-105 active:scale-95"
                title="Attach Images"
              >
                <FaImage className="text-sm" />
              </label>
            </div>

            {/* Input Wrapper Field */}
            <div className="flex-1 relative flex items-center bg-bg-primary border border-border hover:border-border-hover focus-within:border-primary focus-within:ring-1 focus-within:ring-primary rounded-xl px-3 py-1.5 transition-all duration-300">
              
              {/* Quick Emojis Bar (Desktop Hover feature) */}
              {recentEmojis.length > 0 && !showEmojiPicker && (
                <div className="hidden md:flex items-center gap-1 mr-2 px-1.5 py-0.5 bg-surface/50 border border-border/50 rounded-lg">
                  {recentEmojis.map((emoji, i) => (
                    <button 
                      key={i} 
                      onClick={() => onEmojiClick({ emoji })}
                      className="hover:scale-125 transition-transform duration-150 text-sm"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <input 
                ref={inputRef}
                type="text"
                placeholder="Write a message..."
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-sm text-text-primary placeholder:text-text-muted outline-none border-none py-1.5 font-medium"
              />

              {/* Emoji popover button inside right of input */}
              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className="p-1.5 text-text-secondary hover:text-primary transition-all duration-300 hover:scale-110 active:scale-90"
                title="Choose Emoji"
              >
                <FaSmile className="text-lg" />
              </button>
            </div>

            {/* Microphone Voice button */}
            <button 
              onClick={startRecording}
              className="w-10 h-10 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border hover:border-border-hover text-text-secondary hover:text-primary shadow-sm transition-all duration-300 flex items-center justify-center hover:scale-105 active:scale-95"
              title="Record Voice Note"
            >
              <FaMicrophone className="text-sm" />
            </button>

            {/* Send Button */}
            <button 
              onClick={handleSend}
              disabled={!message.trim() && attachments.length === 0}
              className={`w-10 h-10 rounded-xl border transition-all duration-300 flex items-center justify-center ${
                (message.trim() || attachments.length > 0)
                ? "bg-gradient-to-r from-primary to-primary-hover border-primary text-text-inverse shadow-md cursor-pointer hover:scale-105 active:scale-95"
                : "bg-surface border-border text-text-disabled cursor-not-allowed"
              }`}
              title="Send Message"
            >
              <IoIosSend className="text-xl" />
            </button>
          </>
        ) : recordingState === 'recording' ? (
          /* VOICE RECORDING STATE PANEL */
          <div className="flex-1 flex items-center justify-between bg-bg-primary border border-border rounded-xl px-4 py-2.5 animate-slide-in">
            <div className="flex items-center gap-3">
              {/* Pulsing visual recording dot */}
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-sm font-semibold text-rose-500 tabular-nums">
                {formatTime(recordingTime)}
              </span>
            </div>

            {/* Real-time Waveform Canvas visualizer */}
            <div className="flex-1 max-w-sm px-6 h-6 flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                width={200} 
                height={24} 
                className="w-full h-full bg-transparent opacity-80"
              />
            </div>

            {/* Recording Controls */}
            <div className="flex items-center gap-1.5">
              {/* Discard / Cancel Button */}
              <button 
                onClick={cancelRecording}
                className="p-2 rounded-lg text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200"
                title="Cancel recording"
              >
                <FaTrashAlt className="text-sm" />
              </button>

              {/* Stop & Preview Button */}
              <button 
                onClick={stopRecording}
                className="p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-all duration-200"
                title="Stop and preview"
              >
                <FaStop className="text-xs" />
              </button>

              {/* Upload Instantly Send Button */}
              <button 
                onClick={sendVoiceMessage}
                className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-95"
                title="Send voice note"
              >
                <IoIosSend className="text-base" />
              </button>
            </div>
          </div>
        ) : (
          /* RECORDED PREVIEW MODE / PREVIEW STATE */
          <div className="flex-1 flex items-center justify-between bg-bg-primary border border-border rounded-xl px-4 py-2.5 animate-slide-in">
            <div className="flex items-center gap-2">
              {/* Preview Play/Pause button */}
              <button 
                onClick={togglePreviewPlayback}
                className="w-8 h-8 rounded-full bg-primary/10 hover:bg-primary/20 text-primary flex items-center justify-center transition-all duration-200"
                title={previewPlaying ? "Pause Preview" : "Play Preview"}
              >
                {previewPlaying ? <FaPause className="text-xs" /> : <FaPlay className="text-xs ml-0.5" />}
              </button>

              <span className="text-xs font-semibold text-text-primary">
                Voice Note Preview ({formatTime(recordingTime)})
              </span>
            </div>

            {/* Upload details / loading */}
            {isUploading && (
              <div className="flex items-center gap-2 text-text-secondary text-[11px] font-medium">
                <span className="w-3 h-3 border-2 border-primary/20 border-t-primary rounded-full animate-spin inline-block" />
                Uploading voice...
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2">
              {/* Discard Button */}
              <button 
                onClick={cancelRecording}
                disabled={isUploading}
                className="p-2 rounded-lg text-text-secondary hover:text-rose-500 hover:bg-rose-500/10 transition-all duration-200 disabled:opacity-50"
                title="Discard voice note"
              >
                <FaTrashAlt className="text-sm" />
              </button>

              {/* Upload Send Button */}
              <button 
                onClick={sendVoiceMessage}
                disabled={isUploading}
                className="w-8 h-8 rounded-lg bg-primary hover:bg-primary-hover text-text-inverse flex items-center justify-center shadow-md transition-all duration-200 hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                title="Send voice note"
              >
                <IoIosSend className="text-base" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatInput;
