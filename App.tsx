
import React, { useState, useCallback, useRef } from 'react';
import { geminiService } from './services/geminiService';
import { ImageState } from './types';
import { Button } from './components/Button';

const App: React.FC = () => {
  const [state, setState] = useState<ImageState>({
    original: null,
    processed: null,
    isLoading: false,
    error: null,
  });
  const [customPrompt, setCustomPrompt] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setState({
          original: reader.result as string,
          processed: null,
          isLoading: false,
          error: null,
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const processImage = async (prompt: string) => {
    if (!state.original) return;

    setState(prev => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await geminiService.editImage(state.original, prompt);
      setState(prev => ({ ...prev, processed: result, isLoading: false }));
    } catch (err: any) {
      setState(prev => ({ ...prev, error: err.message, isLoading: false }));
    }
  };

  const convertToBlackAndWhite = () => {
    processImage("Convert this image to a high-contrast black and white photo. Maintain all details but remove all color saturation.");
  };

  const handleCustomEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customPrompt.trim()) return;
    processImage(customPrompt);
  };

  const reset = () => {
    setState({
      original: null,
      processed: null,
      isLoading: false,
      error: null,
    });
    setCustomPrompt("");
  };

  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8">
      <header className="max-w-6xl mx-auto mb-12 text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-4">
          Timeless Black & White
        </h1>
        <p className="text-slate-400 text-lg max-w-2xl mx-auto">
          Transform your photos instantly. Convert to black & white or use powerful AI prompts to edit anything.
        </p>
      </header>

      <main className="max-w-6xl mx-auto">
        {!state.original ? (
          <div 
            onClick={handleUploadClick}
            className="border-2 border-dashed border-slate-800 rounded-3xl p-12 md:p-24 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500/50 hover:bg-slate-900/50 transition-all group"
          >
            <div className="bg-slate-800 p-6 rounded-full mb-6 group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-2">Drop your photo here</h2>
            <p className="text-slate-500 mb-8">Supports PNG, JPG, and WEBP</p>
            <Button onClick={handleUploadClick}>Choose File</Button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              className="hidden" 
              accept="image/*"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Control Panel */}
            <aside className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 p-6 rounded-2xl sticky top-8">
                <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M11.3 1.047a1 1 0 01.897.95V4.69l3.393-.582a1 1 0 11.34 1.97l-3.393.582.582 3.393a1 1 0 01-1.97.34l-.582-3.393-3.393.582a1 1 0 11-.34-1.97l3.393-.582V1.997a1 1 0 01.95-1.047h.047z" clipRule="evenodd" />
                  </svg>
                  Edit Options
                </h3>
                
                <div className="space-y-4">
                  <Button 
                    onClick={convertToBlackAndWhite} 
                    className="w-full"
                    variant="outline"
                    isLoading={state.isLoading}
                  >
                    Convert to B&W
                  </Button>

                  <form onSubmit={handleCustomEdit} className="space-y-2">
                    <label className="text-sm font-medium text-slate-400">Custom AI Prompt</label>
                    <textarea 
                      value={customPrompt}
                      onChange={(e) => setCustomPrompt(e.target.value)}
                      placeholder='e.g., "Add a retro 80s filter", "Remove the background", "Make it look like an oil painting"'
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none h-32 resize-none"
                    />
                    <Button 
                      type="submit"
                      variant="secondary"
                      className="w-full"
                      isLoading={state.isLoading}
                      disabled={!customPrompt.trim()}
                    >
                      Magic Edit
                    </Button>
                  </form>

                  <div className="pt-4 border-t border-slate-800">
                    <Button 
                      onClick={reset}
                      variant="danger"
                      className="w-full opacity-70 hover:opacity-100"
                    >
                      New Image
                    </Button>
                  </div>
                </div>

                {state.error && (
                  <div className="mt-4 p-3 bg-red-900/20 border border-red-900/50 text-red-400 text-xs rounded-lg">
                    {state.error}
                  </div>
                )}
              </div>
            </aside>

            {/* Canvas Area */}
            <div className="lg:col-span-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Original Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-slate-500">Original</span>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center">
                    <img src={state.original} alt="Original" className="max-w-full max-h-full object-contain" />
                  </div>
                </div>

                {/* Processed Preview */}
                <div className="space-y-2">
                  <span className="text-xs font-bold uppercase tracking-widest text-blue-500">
                    {state.processed ? "Result" : "Processing Output"}
                  </span>
                  <div className="aspect-square rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 flex items-center justify-center relative">
                    {state.isLoading ? (
                      <div className="flex flex-col items-center gap-4 animate-pulse">
                        <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-sm text-slate-400">Gemini is reimagining your image...</p>
                      </div>
                    ) : state.processed ? (
                      <img src={state.processed} alt="Processed" className="max-w-full max-h-full object-contain" />
                    ) : (
                      <div className="text-slate-600 text-center px-8">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Select an edit option to see the magic
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {state.processed && (
                <div className="flex justify-center">
                  <a 
                    href={state.processed} 
                    download="nano-edit-result.png"
                    className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-full font-bold shadow-xl shadow-emerald-500/20 transition-all transform hover:-translate-y-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                    Download Masterpiece
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <footer className="max-w-6xl mx-auto mt-24 pb-8 text-center text-slate-500 text-sm border-t border-slate-900 pt-8 space-y-2">
        <p className="flex items-center justify-center gap-1">
          Developed with <span className="text-red-500 animate-pulse">❤️</span> by <span className="font-semibold text-slate-300">sivasai nukala</span>
        </p>
        <p className="opacity-60">
          &copy; {currentYear} Sivasai Nukala. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

export default App;
