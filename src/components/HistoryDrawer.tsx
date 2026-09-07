"use client";

import React, { useState } from "react";
import { X, Search, Trash2, ArrowUpRight, History as HistoryIcon, Clock } from "lucide-react";
import { HistoryItem } from "@/types/consensus";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: HistoryItem[];
  onSelect: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onSelect,
  onDelete,
  onClearAll,
}) => {
  const [searchTerm, setSearchTerm] = useState("");

  if (!isOpen) return null;

  const filteredItems = items.filter((item) =>
    item.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-md bg-[#0b0f17] border-l border-white/10 p-6 flex flex-col h-full shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <HistoryIcon className="h-5 w-5 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Verification History</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-white/5 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="my-4 relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search past questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.02] py-2 pl-9 pr-4 text-xs text-white placeholder:text-slate-500 outline-none focus:border-cyan-500/50"
          />
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-xs text-slate-500">
              {items.length === 0 ? "No verification history recorded yet." : "No matching questions found."}
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  onSelect(item);
                  onClose();
                }}
                className="group cursor-pointer rounded-xl border border-white/5 bg-white/[0.02] p-3 hover:border-cyan-500/30 hover:bg-white/5 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-xs font-semibold text-slate-200 line-clamp-2">
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

                <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                  </div>
                  <span className="capitalize text-slate-400">{item.mode} mode</span>
                  <span className="rounded bg-white/5 px-1.5 py-0.5 text-cyan-400 font-medium">
                    {item.confidenceLevel}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer: Clear All */}
        {items.length > 0 && (
          <div className="mt-4 border-t border-white/10 pt-3">
            <button
              onClick={onClearAll}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-rose-500/20 bg-rose-500/10 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20 transition-all"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Clear All History</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
