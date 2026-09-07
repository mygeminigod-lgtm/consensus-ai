"use client";

import React, { useState } from "react";
import { X, Search, Trash2, Bookmark, ExternalLink } from "lucide-react";
import { SavedAnswer } from "@/types/consensus";

interface SavedAnswersDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: SavedAnswer[];
  onSelect: (item: SavedAnswer) => void;
  onDelete: (id: string) => void;
}

export const SavedAnswersDrawer: React.FC<SavedAnswersDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredItems = items.filter((item) =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0b0f17] border-l border-white/10 p-6 flex flex-col h-full shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-amber-400 fill-amber-400" />
            <h3 className="text-base font-bold text-white">Saved Answers ({items.length})</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="my-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search saved bookmarks..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {items.length === 0 ? "No saved answers yet. Click 'Save Answer' on any verified answer." : "No matching bookmarks found."}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-3.5 hover:border-amber-500/30 hover:bg-white/5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-bold text-white line-clamp-2">
                    {item.question}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(item.id);
                    }}
                    className="text-slate-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>

                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">
                  {item.finalAnswer.directAnswer}
                </p>

                <div className="mt-3 flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-white/5">
                  <span className="text-amber-400 font-medium">
                    Confidence: {item.finalAnswer.confidence.level}
                  </span>
                  <span>{item.finalAnswer.modelsConsulted.length} models</span>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
