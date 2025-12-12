import React, { useState, useRef } from 'react';
import { Upload, X, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';
import { analyzeImageWithGemini, fileToGenerativePart } from '../services/gemini';
import { MarkdownRenderer } from './MarkdownRenderer';

export const VisionMode: React.FC = () => {
  const [image, setImage] = useState<{ src: string; file: File; mimeType: string } | null>(null);
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { inlineData } = await fileToGenerativePart(file);
      setImage({
        src: URL.createObjectURL(file),
        file,
        mimeType: inlineData.mimeType
      });
      setResult(null);
    } catch (error) {
      console.error("Error reading file:", error);
    }
  };

  const handleClear = () => {
    setImage(null);
    setResult(null);
    setPrompt('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAnalyze = async () => {
    if (!image || !prompt.trim() || isLoading) return;

    setIsLoading(true);
    setResult(null);

    try {
      // Need to re-read the file to base64 just before sending, or use the stored base64 if we kept it.
      // Ideally we shouldn't store huge strings in state if not needed, so re-reading is safer for memory.
      const { inlineData } = await fileToGenerativePart(image.file);
      const text = await analyzeImageWithGemini(prompt, inlineData.data, inlineData.mimeType);
      setResult(text);
    } catch (error) {
      setResult("Error analyzing image. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
       <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Visual Analysis</h2>
        <p className="text-sm text-gray-500">Upload an image and ask questions about it</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto space-y-8">
          
          {/* Upload Area */}
          <div className="space-y-4">
            {!image ? (
              <div 
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-gray-300 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer h-64"
              >
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                  <Upload size={32} />
                </div>
                <p className="font-medium text-gray-600">Click to upload an image</p>
                <p className="text-sm">JPG, PNG, WEBP supported</p>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
              </div>
            ) : (
              <div className="relative group rounded-2xl overflow-hidden shadow-lg border border-gray-200 bg-gray-100 max-h-96 flex items-center justify-center">
                 <img src={image.src} alt="Uploaded preview" className="max-w-full max-h-96 object-contain" />
                 <button 
                  onClick={handleClear}
                  className="absolute top-4 right-4 bg-white/90 hover:bg-red-50 text-gray-600 hover:text-red-500 p-2 rounded-full shadow-md transition-all opacity-0 group-hover:opacity-100"
                >
                  <X size={20} />
                 </button>
              </div>
            )}
          </div>

          {/* Prompt Area */}
          <div className="flex gap-2">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask something about the image..."
              className="flex-1 px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-100 focus:border-blue-400 outline-none transition-all"
              onKeyDown={(e) => e.key === 'Enter' && handleAnalyze()}
            />
            <button
              onClick={handleAnalyze}
              disabled={!image || !prompt.trim() || isLoading}
              className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-xl shadow-sm transition-all flex items-center gap-2"
            >
              {isLoading ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
              Analyze
            </button>
          </div>

          {/* Results Area */}
          {(result || isLoading) && (
             <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 shadow-inner min-h-[100px]">
                <div className="flex items-center gap-2 mb-4 text-gray-500 font-medium text-sm uppercase tracking-wide">
                  <ImageIcon size={16} />
                  Analysis Result
                </div>
                {isLoading ? (
                  <div className="space-y-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                  </div>
                ) : (
                  <MarkdownRenderer content={result || ''} />
                )}
             </div>
          )}

        </div>
      </div>
    </div>
  );
};
