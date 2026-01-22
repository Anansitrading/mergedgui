import React from "react";
import { X, Save } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700 shadow-2xl rounded-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-6 border-b border-slate-800">
          <h2 className="text-lg font-bold tracking-tight text-slate-100">
            System Configuration
          </h2>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Appearance
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Density
                </label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none">
                  <option>Comfortable</option>
                  <option>Compact</option>
                  <option>Dense</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Theme
                </label>
                <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none">
                  <option>System</option>
                  <option>Dark</option>
                  <option>Light</option>
                </select>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">
              Agent
            </h3>
            <div className="space-y-2">
              <label className="text-xs text-slate-300 font-medium">
                Gemini Model
              </label>
              <select className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:border-blue-500 outline-none">
                <option>gemini-3-pro-preview</option>
                <option>gemini-2.5-flash</option>
              </select>
            </div>
            <div className="flex items-center justify-between py-2">
              <label className="text-sm text-slate-300">
                Auto-connect to WebSocket
              </label>
              <input
                type="checkbox"
                defaultChecked
                className="w-4 h-4 accent-blue-600 rounded"
              />
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-400 hover:text-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2 shadow-lg shadow-blue-600/20"
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}
