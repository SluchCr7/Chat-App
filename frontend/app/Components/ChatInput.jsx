'use client';

import React, { useContext, useState, useEffect, useRef, useCallback } from 'react';
import { 
  FaPaperclip, FaImage, FaSmile, FaMicrophone, FaReply, 
  FaTrashAlt, FaStop, FaPlay, FaPause 
} from "react-icons/fa";
import { 
  LuPaperclip, LuImage, LuSmile, LuMic, LuReply, 
  LuTrash2, LuSquare, LuPlay, LuPause, LuSend, LuX 
} from "react-icons/lu";
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
    directChats = [],
    groupChats = [],
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
  const [isSending, setIsSending] = useState(false);
  
  const typingTimeoutRef = useRef(null);
  const draftSaveTimeoutRef = useRef(null);
  const textareaRef = useRef(null);

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

  // Auto-resize textarea to fit content up to 140px
  const adjustTextareaHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      const newHeight = Math.min(textarea.scrollHeight, 140);
      textarea.style.height = `${Math.max(38, newHeight)}px`;
    }
  };

  useEffect(() => {
    adjustTextareaHeight();
  }, [message]);

  // Populate drafts on target conversation change
  useEffect(() => {
    setMessage('');
    setReplyMessage(null);
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

  // Save draft automatically with debounce
  const triggerDraftSave = (text) => {
    if (!targetId) return;

    if (draftSaveTimeoutRef.current) clearTimeout(draftSaveTimeoutRef.current);

    draftSaveTimeoutRef.current = setTimeout(async () => {
      let chatId = targetId;
      if (type === "direct") {
        const activeDM = directChats.find(c => c.recipient?._id === targetId);
        if (activeDM) chatId = activeDM._id;
        else return;
      }
      await handleSaveDraft(chatId, type, text);
    }, 800);
  };

  // Real-time Typing Handlers
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

  // Emoji Actions
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

    const input = textareaRef.current;
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
        adjustTextareaHeight();
      }, 10);
    } else {
      setMessage((prev) => prev + emoji);
    }
  };

  // Voice Recording Actions
  const startRecording = async () => {
    try {
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
      toast.error("Microphone permission denied or not available.");
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
        
        ctx.fillStyle = '#8b5cf6'; // Violet theme wave

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

      await AddNewMessage('', [], null, {
        url,
        duration: recordingTime,
        fileSize
      });

      setAudioBlob(null);
      setAudioUrl('');
      setRecordingState('idle');
    } catch (err) {
      console.error("Failed to upload voice message:", err);
      toast.error("Failed to send voice message.");
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

  // File Handler Actions
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    const validFiles = files.filter(file => {
      if (file.size > 15 * 1024 * 1024) {
        toast.error(`File "${file.name}" exceeds 15MB limit.`);
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
    if ((!message.trim() && attachments.length === 0) || isSending) return;

    setIsSending(true);

    try {
      if (socket && targetId) {
        setIsTyping(false);
        socket.emit("typingStop", { targetId, type });
      }

      const replyToId = replyMessage ? replyMessage._id : null;
      await AddNewMessage(message, attachments, replyToId);
      
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
      if (textareaRef.current) {
        textareaRef.current.style.height = '38px';
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e) => {
    // Send on Enter (unless Shift+Enter is pressed for newline)
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
    <div className="border-t border-border p-3 sm:p-4 bg-surface/90 backdrop-blur-md flex flex-col space-y-2.5 relative transition-colors duration-200">
      
      {/* Reply Reference Preview Bar */}
      {replyMessage && (
        <div className="flex items-center justify-between p-2.5 px-3 bg-primary/10 border border-primary/20 rounded-2xl">
          <div className="flex items-center gap-2 text-left overflow-hidden">
            <LuReply className="text-primary text-xs flex-shrink-0" />
            <div className="flex flex-col overflow-hidden leading-tight">
              <span className="text-[10px] font-black text-primary uppercase tracking-wider">
                Replying to @{replyMessage.sender?.username || "user"}
              </span>
              <p className="text-xs text-text-secondary truncate italic font-medium">
                {replyMessage.text || (replyMessage.Photos?.length ? "Photo attachment" : "Audio note")}
              </p>
            </div>
          </div>
          <button 
            onClick={() => setReplyMessage(null)}
            className="p-1 rounded-full text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition"
            title="Cancel Reply"
            aria-label="Cancel Reply"
          >
            <LuX size={15} />
          </button>
        </div>
      )}

      {/* Attachments Preview Bar */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 p-2 bg-bg-primary/80 border border-border rounded-2xl max-h-32 overflow-y-auto">
          {attachments.map((file, index) => {
            const isImage = file.type.startsWith("image/");
            return (
              <div key={index} className="relative flex items-center gap-2 p-1.5 bg-surface rounded-xl border border-border pr-7 text-left">
                {isImage ? (
                  /* eslint-disable-next-line @next/next/no-img-element */
                  <img 
                    src={URL.createObjectURL(file)} 
                    alt="attachment preview" 
                    className="w-8 h-8 object-cover rounded-lg border border-border" 
                  />
                ) : (
                  <LuPaperclip className="text-primary text-xs" />
                )}
                <div className="flex flex-col max-w-[120px]">
                  <span className="text-[10px] font-bold text-text-primary truncate">{file.name}</span>
                  <span className="text-[8px] text-text-muted font-medium">{(file.size / 1024 / 1024).toFixed(2)} MB</span>
                </div>
                <button 
                  onClick={() => handleRemoveAttachment(index)}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-rose-400 transition"
                  aria-label="Remove attachment"
                >
                  <LuX size={13} />
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Floating Emoji Picker Drawer */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef} 
          className="absolute bottom-20 left-4 z-50 shadow-2xl w-[320px] sm:w-[350px] max-w-[90vw]"
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

      {/* Main Composer Interaction Deck */}
      <div className="flex items-end gap-2 w-full">
        {recordingState === 'idle' ? (
          <>
            {/* Attachment Buttons */}
            <div className="flex items-center gap-1 pb-0.5">
              <input 
                type="file"
                id="file-attachment"
                multiple
                onChange={handleFileChange}
                className="hidden"
              />
              <label 
                htmlFor="file-attachment"
                className="w-9 h-9 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-primary transition cursor-pointer flex items-center justify-center focus-within:ring-2 focus-within:ring-primary"
                title="Attach Files"
                aria-label="Attach Documents or Files"
              >
                <LuPaperclip className="text-sm" />
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
                className="w-9 h-9 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-primary transition cursor-pointer flex items-center justify-center focus-within:ring-2 focus-within:ring-primary"
                title="Attach Images"
                aria-label="Attach Images"
              >
                <LuImage className="text-sm" />
              </label>
            </div>

            {/* Expanding Textarea Field */}
            <div className="flex-1 relative flex items-center bg-bg-primary border border-border focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 rounded-xl px-3 py-1.5 transition">
              
              {/* Quick Emojis Bar */}
              {recentEmojis.length > 0 && !showEmojiPicker && (
                <div className="hidden sm:flex items-center gap-1 mr-2 px-1.5 py-0.5 bg-surface/60 border border-border/50 rounded-lg">
                  {recentEmojis.map((emoji, i) => (
                    <button 
                      key={i} 
                      onClick={() => onEmojiClick({ emoji })}
                      className="hover:scale-125 transition text-xs"
                      aria-label={`Insert ${emoji}`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}

              <textarea 
                ref={textareaRef}
                rows={1}
                placeholder="Write a message... (Enter to send, Shift+Enter for new line)"
                value={message}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                className="flex-1 bg-transparent text-xs text-text-primary placeholder:text-text-muted outline-none border-none py-1 resize-none font-medium leading-relaxed max-h-36 wa-scroll"
              />

              <button 
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                className={`p-1.5 rounded-lg transition ml-1 flex-shrink-0 ${
                  showEmojiPicker ? 'text-primary bg-primary/10' : 'text-text-muted hover:text-text-primary'
                }`}
                title="Choose Emoji"
                aria-label="Emoji Picker"
              >
                <LuSmile className="text-base" />
              </button>
            </div>

            {/* Microphone Voice button */}
            <button 
              onClick={startRecording}
              className="w-9 h-9 pb-0.5 rounded-xl bg-bg-primary hover:bg-surface-hover border border-border text-text-secondary hover:text-primary transition flex items-center justify-center flex-shrink-0"
              title="Record Voice Note"
              aria-label="Record Voice Note"
            >
              <LuMic className="text-sm" />
            </button>

            {/* Send Button */}
            <button 
              onClick={handleSend}
              disabled={(!message.trim() && attachments.length === 0) || isSending}
              className={`w-9 h-9 rounded-xl border transition flex items-center justify-center flex-shrink-0 ${
                (message.trim() || attachments.length > 0) && !isSending
                ? "bg-primary border-primary text-text-inverse shadow-sm cursor-pointer hover:bg-primary-hover active:scale-95"
                : "bg-surface border-border text-text-disabled cursor-not-allowed opacity-60"
              }`}
              title="Send Message"
              aria-label="Send Message"
            >
              <LuSend className="text-sm" />
            </button>
          </>
        ) : recordingState === 'recording' ? (
          /* LIVE VOICE RECORDING MODE */
          <div className="flex-1 flex items-center justify-between bg-bg-primary border border-border rounded-xl px-4 py-2">
            <div className="flex items-center gap-2.5">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping" />
              <span className="text-xs font-bold text-rose-500 tabular-nums">
                {formatTime(recordingTime)}
              </span>
            </div>

            <div className="flex-1 max-w-xs px-4 h-6 flex items-center justify-center">
              <canvas 
                ref={canvasRef} 
                width={180} 
                height={24} 
                className="w-full h-full bg-transparent opacity-85"
              />
            </div>

            <div className="flex items-center gap-1.5">
              <button 
                onClick={cancelRecording}
                className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition"
                title="Cancel recording"
                aria-label="Discard recording"
              >
                <LuTrash2 className="text-sm" />
              </button>
              <button 
                onClick={stopRecording}
                className="p-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition"
                title="Stop and preview"
                aria-label="Stop recording"
              >
                <LuSquare className="text-xs" />
              </button>
              <button 
                onClick={sendVoiceMessage}
                className="w-8 h-8 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white flex items-center justify-center shadow-md transition"
                title="Send voice note"
                aria-label="Send voice note"
              >
                <LuSend className="text-xs" />
              </button>
            </div>
          </div>
        ) : (
          /* RECORDED AUDIO PREVIEW MODE */
          <div className="flex-1 flex items-center justify-between bg-bg-primary border border-border rounded-xl px-4 py-2">
            <div className="flex items-center gap-2.5">
              <button 
                onClick={togglePreviewPlayback}
                className="w-7 h-7 rounded-full bg-primary/10 text-primary flex items-center justify-center transition hover:bg-primary/20"
                title={previewPlaying ? "Pause Preview" : "Play Preview"}
                aria-label={previewPlaying ? "Pause Voice Preview" : "Play Voice Preview"}
              >
                {previewPlaying ? <LuPause className="text-xs" /> : <LuPlay className="text-xs ml-0.5" />}
              </button>
              <span className="text-xs font-bold text-text-primary">
                Voice Note ({formatTime(recordingTime)})
              </span>
            </div>

            {isUploading && (
              <span className="text-[10px] text-primary font-bold animate-pulse">Uploading voice note...</span>
            )}

            <div className="flex items-center gap-1.5">
              <button 
                onClick={cancelRecording}
                disabled={isUploading}
                className="p-1.5 rounded-lg text-text-muted hover:text-rose-400 hover:bg-rose-500/10 transition disabled:opacity-50"
                title="Discard voice note"
                aria-label="Discard voice note"
              >
                <LuTrash2 className="text-sm" />
              </button>
              <button 
                onClick={sendVoiceMessage}
                disabled={isUploading}
                className="w-8 h-8 rounded-lg bg-primary text-text-inverse hover:bg-primary-hover flex items-center justify-center shadow-md transition disabled:opacity-50"
                title="Send voice note"
                aria-label="Send voice note"
              >
                <LuSend className="text-xs" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(ChatInput);
