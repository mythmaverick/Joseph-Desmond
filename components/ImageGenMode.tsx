import React, { useState } from 'react';
import { Wand2, Download, Loader2, ImagePlus } from 'lucide-react';
import { generateImageWithGemini } from '../services/gemini';
import { GeneratedImage } from '../types';

export const ImageGenMode: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [history, setHistory] = useState<GeneratedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<GeneratedImage | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    try {
      const base64Image = await generateImageWithGemini(prompt);
      
      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: base64Image,
        prompt: prompt,
        timestamp: Date.now()
      };

      setHistory(prev => [newImage, ...prev]);
      setSelectedImage(newImage);
      setPrompt('');
    } catch (error) {
      alert("Failed to generate image. Please try again.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100">
        <h2 className="text-xl font-semibold text-gray-800">Image Studio</h2>
        <p className="text-sm text-gray-500">Create images from text using Gemini</p>
      </div>

      <div className="flex-1 overflow-y-auto p-6">
        <div className="flex flex-col lg:flex-row gap-6 h-full">
          
          {/* Left Panel: Controls & History */}
          <div className="w-full lg:w-1/3 flex flex-col gap-6">
            
            {/* Input */}
            <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 space-y-3">
              <label className="text-sm font-medium text-gray-700">Image Prompt</label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe the image you want to see..."
                className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-100 focus:border-purple-400 outline-none text-sm resize-none h-24"
              />
              <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isGenerating}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
              >
                {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Wand2 size={18} />}
                Generate Image
              </button>
            </div>

            {/* History Grid */}
            <div className="flex-1 overflow-hidden flex flex-col">
               <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
                 <ImagePlus size={16} /> Recent Creations
               </h3>
               <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 pr-2">
                 {history.map((img) => (
                   <div 
                    key={img.id}
                    onClick={() => setSelectedImage(img)}
                    className={`cursor-pointer rounded-lg overflow-hidden border-2 transition-all aspect-square relative group ${
                      selectedImage?.id === img.id ? 'border-purple-500 ring-2 ring-purple-100' : 'border-transparent hover:border-purple-200'
                    }`}
                   >
                     <img src={img.url} alt={img.prompt} className="w-full h-full object-cover" />
                     <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-xs px-2 text-center line-clamp-2">{img.prompt}</span>
                     </div>
                   </div>
                 ))}
                 {history.length === 0 && (
                   <div className="col-span-2 py-8 text-center text-gray-400 text-sm italic">
                     No images generated yet.
                   </div>
                 )}
               </div>
            </div>
          </div>

          {/* Right Panel: Preview */}
          <div className="w-full lg:w-2/3 bg-gray-50 rounded-2xl border border-gray-200 flex items-center justify-center p-8 relative min-h-[400px]">
            {selectedImage ? (
              <div className="relative group max-w-full max-h-full">
                <img 
                  src={selectedImage.url} 
                  alt={selectedImage.prompt} 
                  className="max-w-full max-h-[600px] object-contain rounded-lg shadow-lg" 
                />
                <div className="absolute bottom-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <a 
                    href={selectedImage.url} 
                    download={`gemini-gen-${selectedImage.id}.png`}
                    className="p-2 bg-white text-gray-700 rounded-full shadow-lg hover:bg-gray-100 transition-colors"
                    title="Download"
                  >
                    <Download size={20} />
                  </a>
                </div>
                <div className="mt-4 text-center">
                   <p className="text-gray-700 font-medium">{selectedImage.prompt}</p>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-400">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Wand2 size={32} className="text-gray-400" />
                </div>
                <p>Select or generate an image to preview</p>
              </div>
            )}
            
            {isGenerating && (
              <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center">
                <Loader2 size={48} className="animate-spin text-purple-600 mb-4" />
                <p className="text-purple-800 font-medium animate-pulse">Creating your masterpiece...</p>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
};
