'use client';

import React, { useContext, useState, useEffect } from 'react';
import Logo from '@/app/Components/Logo';
import { ThemeContext } from '@/app/Context/ThemeContext';
import { 
  FaPalette, 
  FaImage, 
  FaRegImage, 
  FaCheck, 
  FaTimes, 
  FaLink,
  FaSlidersH
} from 'react-icons/fa';
import { 
  MdPattern, 
  MdWallpaper, 
  MdTexture, 
  MdLayersClear
} from 'react-icons/md';

const themes = [
  { name: 'white', bg: '#f8fafc', text: '#0f172a', border: 'border-slate-300' },
  { name: 'black', bg: '#090b11', text: '#f3f4f6', border: 'border-slate-800' },
  { name: 'red', bg: '#0d090a', text: '#ffe4e6', border: 'border-rose-950' },
  { name: 'green', bg: '#050a07', text: '#d1fae5', border: 'border-emerald-950' },
  { name: 'blue', bg: '#050b14', text: '#dbeafe', border: 'border-blue-950' },
  { name: 'yellow', bg: '#080603', text: '#fef9c3', border: 'border-amber-950' },
];

const colorPresets = [
  { name: 'Midnight Dark', value: '#0b141a', isDark: true },
  { name: 'Royal Blue', value: '#0d1e2d', isDark: true },
  { name: 'Forest Green', value: '#05180f', isDark: true },
  { name: 'Warm Amber', value: '#231815', isDark: true },
  { name: 'Deep Purple', value: '#1b1329', isDark: true },
  { name: 'Beige Classic', value: '#efeae2', isDark: false },
  { name: 'Sky Blue', value: '#e0f2fe', isDark: false },
  { name: 'Mint Green', value: '#ecfdf5', isDark: false },
  { name: 'Lavender Soft', value: '#f5f3ff', isDark: false },
  { name: 'Rose Petal', value: '#fff1f2', isDark: false },
];

const patterns = [
  {
    name: 'Clean Dots',
    value: `data:image/svg+xml;utf8,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><circle cx='2' cy='2' r='1' fill='%23888888' opacity='0.35'/></svg>"
    )}`
  },
  {
    name: 'Grid Lines',
    value: `data:image/svg+xml;utf8,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='30' height='30' viewBox='0 0 30 30'><path d='M 30 0 L 0 0 0 30' fill='none' stroke='%23888888' stroke-width='0.8' opacity='0.25'/></svg>"
    )}`
  },
  {
    name: 'Diagonal Lines',
    value: `data:image/svg+xml;utf8,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20'><path d='M-1 1 l2 -2 M0 20 l20 -20 M19 21 l2 -2' fill='none' stroke='%23888888' stroke-width='1.2' opacity='0.25'/></svg>"
    )}`
  },
  {
    name: 'Retro Crosses',
    value: `data:image/svg+xml;utf8,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'><path d='M12 4 v16 M4 12 h16' fill='none' stroke='%23888888' stroke-width='1.0' opacity='0.25'/></svg>"
    )}`
  },
  {
    name: 'Wavy Lines',
    value: `data:image/svg+xml;utf8,${encodeURIComponent(
      "<svg xmlns='http://www.w3.org/2000/svg' width='30' height='15' viewBox='0 0 30 15'><path d='M0 7.5 Q7.5 15 15 7.5 T30 7.5' fill='none' stroke='%23888888' stroke-width='1' opacity='0.25'/></svg>"
    )}`
  }
];

const curatedImages = [
  { name: 'Dark Abstract', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=60' },
  { name: 'Soft Gradient', url: 'https://images.unsplash.com/photo-1557683316-973673baf926?w=500&auto=format&fit=crop&q=60' },
  { name: 'Starry Night', url: 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?w=500&auto=format&fit=crop&q=60' },
  { name: 'Pastel Aurora', url: 'https://images.unsplash.com/photo-1533158326339-7f3cf2404354?w=500&auto=format&fit=crop&q=60' },
  { name: 'Geometric Art', url: 'https://images.unsplash.com/photo-1604871000636-074fa5117945?w=500&auto=format&fit=crop&q=60' },
  { name: 'Cozy Abstract', url: 'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=500&auto=format&fit=crop&q=60' }
];

const ThemeSettingsPage = () => {
  const { theme, setTheme, wallpaper, setWallpaper } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState('none'); // 'none', 'color', 'pattern', 'image'
  const [customUrl, setCustomUrl] = useState('');
  const [selectedPatternColor, setSelectedPatternColor] = useState('');

  // Initialize tabs based on active wallpaper
  useEffect(() => {
    if (wallpaper) {
      setActiveTab(wallpaper.type || 'none');
      if (wallpaper.type === 'image' && !curatedImages.some(img => img.url === wallpaper.value)) {
        setCustomUrl(wallpaper.value);
      }
      if (wallpaper.type === 'pattern' && wallpaper.color) {
        setSelectedPatternColor(wallpaper.color);
      }
    }
  }, [wallpaper]);

  const handleSelectColor = (colorHex) => {
    setWallpaper({
      type: 'color',
      value: colorHex,
      opacity: wallpaper.opacity ?? 0.15
    });
  };

  const handleSelectPattern = (patternSvg) => {
    setWallpaper({
      type: 'pattern',
      value: patternSvg,
      color: selectedPatternColor || '',
      opacity: wallpaper.opacity ?? 0.15
    });
  };

  const handleSelectPatternColor = (colorHex) => {
    setSelectedPatternColor(colorHex);
    if (wallpaper.type === 'pattern') {
      setWallpaper(prev => ({
        ...prev,
        color: colorHex
      }));
    }
  };

  const handleSelectImage = (url) => {
    setWallpaper({
      type: 'image',
      value: url,
      opacity: wallpaper.opacity ?? 0.15
    });
  };

  const handleCustomUrlApply = (e) => {
    e.preventDefault();
    if (customUrl.trim()) {
      setWallpaper({
        type: 'image',
        value: customUrl.trim(),
        opacity: wallpaper.opacity ?? 0.15
      });
    }
  };

  const handleOpacityChange = (e) => {
    const val = parseFloat(e.target.value);
    setWallpaper(prev => ({
      ...prev,
      opacity: val
    }));
  };

  const handleClearWallpaper = () => {
    setWallpaper({
      type: 'none',
      value: '',
      opacity: 0.15
    });
  };

  // Helper to format live preview styling
  const getPreviewStyle = () => {
    if (!wallpaper || wallpaper.type === 'none') return {};
    if (wallpaper.type === 'color') return { backgroundColor: wallpaper.value };
    if (wallpaper.type === 'pattern') {
      const style = {
        backgroundImage: `url(${wallpaper.value})`,
        backgroundSize: 'auto',
        backgroundRepeat: 'repeat',
        backgroundPosition: 'center',
      };
      if (wallpaper.color) style.backgroundColor = wallpaper.color;
      return style;
    }
    if (wallpaper.type === 'image') {
      return {
        backgroundImage: `url(${wallpaper.value})`,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',
      };
    }
    return {};
  };

  return (
    <div className="min-h-screen bg-bg-primary text-text-primary py-14 px-6 transition-all duration-300">
      <div className="mx-auto max-w-5xl space-y-10 text-left">
        
        {/* Settings Outer Card */}
        <div className="rounded-[28px] border border-border bg-surface p-8 shadow-xl">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-3 rounded-2xl bg-bg-primary/50 border border-border px-4 py-3 shadow-inner">
              <Logo compact />
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-text-primary">Appearance Settings</h1>
                <p className="max-w-2xl text-xs text-text-secondary font-medium mt-0.5">
                  Personalize the app experience with premium themes designed for focus and clarity.
                </p>
              </div>
            </div>
          </div>

          {/* Theme Selector panel */}
          <div className="mt-8 rounded-2xl border border-border bg-bg-primary/40 p-6 shadow-inner">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-border pb-4 mb-6">
              <div>
                <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">Choose Theme Accent</h2>
                <p className="text-xs text-text-muted mt-1 font-bold">
                  Current theme: <span className="text-primary uppercase font-extrabold tracking-wider">{theme}</span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
              {themes.map((t) => {
                const isActive = theme === t.name;
                return (
                  <button
                    key={t.name}
                    onClick={() => setTheme(t.name)}
                    style={{ backgroundColor: t.bg, color: t.text }}
                    className={`rounded-xl p-4 text-xs font-bold transition-all duration-300 border uppercase tracking-wider flex flex-col items-center justify-center gap-2 shadow-sm ${
                      isActive 
                        ? "border-primary ring-2 ring-primary/40 scale-105" 
                        : "border-border hover:scale-102 hover:border-border-hover"
                    }`}
                  >
                    <span>{t.name}</span>
                    <div className={`w-3.5 h-3.5 rounded-full border border-current ${isActive ? "bg-current" : "bg-transparent"}`}></div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Wallpaper Panel */}
          <div className="mt-8 rounded-2xl border border-border bg-bg-primary/40 p-6 shadow-inner">
            <div className="border-b border-border pb-4 mb-6">
              <h2 className="text-base font-bold text-text-primary uppercase tracking-wider">Chat Wallpaper</h2>
              <p className="text-xs text-text-secondary mt-1 font-semibold">
                Set a customized background color, repeating vector pattern, or high resolution image for your chat rooms.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Controls Column */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Tabs */}
                <div className="flex flex-wrap gap-2 p-1 bg-surface border border-border rounded-xl">
                  <button
                    onClick={() => { setActiveTab('none'); handleClearWallpaper(); }}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'none' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-text-secondary hover:bg-bg-primary/50'
                    }`}
                  >
                    <MdLayersClear size={16} />
                    <span>None (Theme Default)</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('color')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'color' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-text-secondary hover:bg-bg-primary/50'
                    }`}
                  >
                    <FaPalette size={14} />
                    <span>Colors</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('pattern')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'pattern' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-text-secondary hover:bg-bg-primary/50'
                    }`}
                  >
                    <MdTexture size={16} />
                    <span>Patterns</span>
                  </button>
                  <button
                    onClick={() => setActiveTab('image')}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-bold transition-all ${
                      activeTab === 'image' 
                        ? 'bg-primary text-white shadow-md' 
                        : 'text-text-secondary hover:bg-bg-primary/50'
                    }`}
                  >
                    <FaImage size={14} />
                    <span>Images</span>
                  </button>
                </div>

                {/* Tab Contents */}
                <div className="p-5 bg-surface border border-border rounded-2xl min-h-[220px] flex flex-col justify-between">
                  
                  {activeTab === 'none' && (
                    <div className="flex flex-col items-center justify-center text-center py-8 space-y-3">
                      <MdLayersClear size={48} className="text-text-muted" />
                      <div>
                        <h4 className="text-sm font-bold text-text-primary">Default Transparent Background</h4>
                        <p className="text-xs text-text-muted max-w-sm mt-1">
                          No active wallpaper. The chat scroll area will blend directly into the underlying active theme accent.
                        </p>
                      </div>
                    </div>
                  )}

                  {activeTab === 'color' && (
                    <div className="space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Select Color Preset</h4>
                      <div className="grid grid-cols-5 gap-2 sm:grid-cols-5">
                        {colorPresets.map((c) => {
                          const isSelected = wallpaper.type === 'color' && wallpaper.value === c.value;
                          return (
                            <button
                              key={c.value}
                              onClick={() => handleSelectColor(c.value)}
                              style={{ backgroundColor: c.value }}
                              className={`aspect-square rounded-xl relative border border-border shadow-sm flex items-center justify-center group hover:scale-105 transition-all duration-300`}
                              title={c.name}
                            >
                              {isSelected && (
                                <span className={`p-1.5 rounded-full ${c.isDark ? 'bg-white/20 text-white' : 'bg-black/10 text-black'} shadow-sm flex items-center justify-center animate-scale-up`}>
                                  <FaCheck size={10} />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'pattern' && (
                    <div className="space-y-5">
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">1. Choose Pattern Design</h4>
                        <div className="grid grid-cols-5 gap-3">
                          {patterns.map((p) => {
                            const isSelected = wallpaper.type === 'pattern' && wallpaper.value === p.value;
                            return (
                              <button
                                key={p.name}
                                onClick={() => handleSelectPattern(p.value)}
                                style={{ 
                                  backgroundImage: `url(${p.value})`,
                                  backgroundSize: 'auto',
                                  backgroundRepeat: 'repeat'
                                }}
                                className={`h-12 rounded-xl border relative shadow-sm flex items-center justify-center hover:border-primary transition-all duration-300 ${
                                  isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                                }`}
                                title={p.name}
                              >
                                {isSelected && (
                                  <span className="p-1 rounded-full bg-primary text-white shadow-sm flex items-center justify-center animate-scale-up">
                                    <FaCheck size={8} />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      <div className="space-y-3 border-t border-border pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">2. Select Background Base Color (Optional)</h4>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => handleSelectPatternColor('')}
                            className={`px-3 py-1.5 rounded-lg border text-[10px] font-extrabold uppercase transition ${
                              selectedPatternColor === '' 
                                ? 'bg-primary border-primary text-white shadow-sm' 
                                : 'border-border bg-bg-primary hover:bg-bg-primary/50 text-text-primary'
                            }`}
                          >
                            Theme Base
                          </button>
                          {colorPresets.map((c) => {
                            const isColorSelected = selectedPatternColor === c.value;
                            return (
                              <button
                                key={c.value}
                                onClick={() => handleSelectPatternColor(c.value)}
                                style={{ backgroundColor: c.value }}
                                className={`w-8 h-8 rounded-lg border border-border relative flex items-center justify-center hover:scale-105 transition`}
                                title={c.name}
                              >
                                {isColorSelected && (
                                  <span className={`p-1 rounded-full ${c.isDark ? 'bg-white/20 text-white' : 'bg-black/15 text-black'}`}>
                                    <FaCheck size={8} />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeTab === 'image' && (
                    <div className="space-y-4">
                      {/* Curated */}
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary">Select Curated Design</h4>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
                          {curatedImages.map((img) => {
                            const isSelected = wallpaper.type === 'image' && wallpaper.value === img.url;
                            return (
                              <button
                                key={img.name}
                                onClick={() => handleSelectImage(img.url)}
                                style={{ 
                                  backgroundImage: `url(${img.url})`,
                                  backgroundSize: 'cover',
                                  backgroundPosition: 'center'
                                }}
                                className={`aspect-square rounded-xl border relative shadow-sm flex items-center justify-center hover:scale-105 transition-all duration-300 ${
                                  isSelected ? 'border-primary ring-2 ring-primary/30' : 'border-border'
                                }`}
                                title={img.name}
                              >
                                {isSelected && (
                                  <span className="p-1.5 rounded-full bg-primary text-white shadow-sm flex items-center justify-center animate-scale-up">
                                    <FaCheck size={8} />
                                  </span>
                                )}
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Custom Input */}
                      <form onSubmit={handleCustomUrlApply} className="space-y-2 border-t border-border pt-4">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-1.5">
                          <FaLink size={10} />
                          Custom Image URL
                        </h4>
                        <div className="flex gap-2">
                          <input
                            type="url"
                            value={customUrl}
                            onChange={(e) => setCustomUrl(e.target.value)}
                            placeholder="Enter image address (e.g. https://images.unsplash.com/...)"
                            className="flex-1 px-4 py-2 text-xs border border-border bg-bg-primary rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/50 text-text-primary"
                          />
                          <button
                            type="submit"
                            className="px-4 py-2 text-xs font-bold bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md transition-all duration-300"
                          >
                            Apply
                          </button>
                        </div>
                      </form>
                    </div>
                  )}

                  {/* Dimmer / Opacity Slider */}
                  {wallpaper && wallpaper.type !== 'none' && (
                    <div className="border-t border-border pt-4 mt-4 space-y-2">
                      <div className="flex items-center justify-between text-xs text-text-secondary font-bold">
                        <span className="flex items-center gap-1.5">
                          <FaSlidersH size={12} className="text-primary" />
                          Wallpaper Opacity / Blend
                        </span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-extrabold text-[10px]">
                          {Math.round((wallpaper.opacity ?? 0.15) * 100)}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min="0.05"
                        max="0.90"
                        step="0.05"
                        value={wallpaper.opacity ?? 0.15}
                        onChange={handleOpacityChange}
                        className="w-full accent-primary bg-bg-primary/50 cursor-pointer h-1.5 rounded-lg border border-border"
                      />
                      <p className="text-[10px] text-text-muted font-bold">
                        Tip: Reduce opacity to blend the wallpaper with the theme and keep text readable.
                      </p>
                    </div>
                  )}

                </div>
              </div>

              {/* Preview Column */}
              <div className="lg:col-span-5 flex flex-col items-center justify-center">
                <div className="w-full max-w-[270px] aspect-[9/16] border border-border rounded-[36px] bg-bg-primary shadow-2xl relative flex flex-col overflow-hidden select-none">
                  {/* Speaker / Camera bar */}
                  <div className="absolute top-0 inset-x-0 h-6 bg-black z-30 flex items-center justify-center">
                    <div className="w-16 h-3 bg-neutral-800 rounded-full"></div>
                  </div>

                  {/* Phone Header Mockup */}
                  <div className="bg-surface/85 backdrop-blur-md border-b border-border pt-7 pb-2 px-4 flex items-center gap-2.5 z-20">
                    <div className="w-8 h-8 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center text-primary font-bold text-xs">
                      JD
                    </div>
                    <div className="flex flex-col text-left">
                      <span className="text-[11px] font-bold text-text-primary">John Doe</span>
                      <span className="text-[9px] text-emerald-500 font-extrabold tracking-wider animate-pulse uppercase">online</span>
                    </div>
                  </div>

                  {/* Phone Chat Area Mockup */}
                  <div className="flex-1 p-3.5 space-y-3.5 relative overflow-hidden flex flex-col justify-end bg-bg-primary">
                    {/* Active Wallpaper inside phone preview */}
                    {wallpaper && wallpaper.type !== 'none' && (
                      <div 
                        className="absolute inset-0 pointer-events-none transition-all duration-300"
                        style={{ ...getPreviewStyle(), opacity: wallpaper.opacity ?? 0.15, zIndex: 0 }}
                      />
                    )}

                    {/* Messages Container */}
                    <div className="space-y-3 z-10 relative">
                      {/* Date Separator */}
                      <div className="flex items-center justify-center">
                        <span className="bg-surface/90 border border-border px-2 py-0.5 rounded-full text-[9px] text-text-secondary font-bold shadow-sm">
                          Today
                        </span>
                      </div>

                      {/* Receiver Message */}
                      <div className="flex justify-start">
                        <div className="bg-surface border border-border text-text-primary px-3 py-2 rounded-2xl rounded-bl-none shadow-sm max-w-[85%] text-[10px] leading-relaxed font-semibold text-left">
                          Hey! How does the new chat wallpaper look in this preview?
                          <span className="block text-[8px] text-text-muted mt-1 text-right">09:41 AM</span>
                        </div>
                      </div>

                      {/* Sender Message */}
                      <div className="flex justify-end">
                        <div className="bg-primary text-white px-3 py-2 rounded-2xl rounded-br-none shadow-sm max-w-[85%] text-[10px] leading-relaxed font-semibold text-left">
                          Wow, it looks incredibly premium! Text contrast is perfect.
                          <span className="block text-[8px] text-white/70 mt-1 text-right">09:42 AM</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <span className="text-[11px] font-extrabold text-text-muted uppercase tracking-wider mt-4 flex items-center gap-1.5">
                  <FaRegImage size={10} className="text-primary" />
                  Real-time Chat Preview
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ThemeSettingsPage;
