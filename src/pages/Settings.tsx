import React, { useEffect, useState } from 'react';
import { 
  Settings as SettingsIcon, 
  Save, 
  Info, 
  Percent, 
  Banknote,
  Layout as LayoutIcon,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { getSettings, saveSettings } from '../lib/db';
import { AppSettings } from '../types';
import { formatNumber, parseNumber, cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export default function Settings() {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    async function loadSettings() {
      const data = await getSettings();
      setSettings(data);
      setLoading(false);
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (settings) {
      await saveSettings(settings);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  };

  const [activeTab, setActiveTab] = useState<'profile' | 'margin' | 'security'>('profile');

  const tabs = [
    { id: 'profile', label: 'Profil Aplikasi', icon: <LayoutIcon className="w-4 h-4" /> },
    { id: 'margin', label: 'Margin Profit', icon: <Percent className="w-4 h-4" /> },
    { id: 'security', label: 'Keamanan', icon: <ShieldCheck className="w-4 h-4" /> },
  ] as const;

  if (loading || !settings) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Pengaturan</h1>
          <p className="text-slate-500 font-medium">Konfigurasi profile dan parameter inti bisnis Anda.</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-2xl font-bold shadow-sm border border-emerald-200"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Perubahan Disimpan
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab Navigation */}
      <div className="flex p-1.5 bg-slate-100/50 rounded-2xl border border-slate-200/60 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex items-center space-x-2 px-6 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap",
              activeTab === tab.id 
                ? "bg-white text-indigo-600 shadow-sm ring-1 ring-slate-200/50" 
                : "text-slate-500 hover:text-slate-700 hover:bg-white/50"
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <div className="relative min-h-[400px]">
          <AnimatePresence mode="wait">
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6">
                  <div className="flex items-center space-x-4 mb-2">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <LayoutIcon className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Profil Toko</h2>
                      <p className="text-xs text-slate-500 font-medium">Informasi publik yang akan muncul di etalase webstore.</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 ml-1">Nama Aplikasi / Toko</label>
                      <input 
                        required
                        type="text"
                        value={settings.appName}
                        onChange={(e) => setSettings({...settings, appName: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-medium"
                        placeholder="Contoh: PC PARTS"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-black text-slate-700 ml-1">Deskripsi & Motto</label>
                      <textarea 
                        rows={4}
                        value={settings.appDescription}
                        onChange={(e) => setSettings({...settings, appDescription: e.target.value})}
                        className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all resize-none font-medium leading-relaxed"
                        placeholder="Jelaskan apa yang membuat toko Anda spesial..."
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'margin' && (
              <motion.div
                key="margin"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-8">
                  <div className="flex items-center space-x-4">
                    <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600">
                      <Percent className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-slate-900">Margin Profit Global</h2>
                      <p className="text-xs text-slate-500 font-medium">Otomatisasi perhitungan harga jual berdasarkan harga beli.</p>
                    </div>
                  </div>

                  <div className="bg-indigo-50/50 p-6 rounded-[2rem] border border-indigo-100 flex items-start space-x-4">
                    <div className="p-2 bg-indigo-100 rounded-xl text-indigo-600 shrink-0">
                      <Info className="w-5 h-5" />
                    </div>
                    <p className="text-sm text-indigo-800 font-medium leading-relaxed">
                      Sistem akan menyarankan harga jual saat Anda menambah stok baru. Margin dapat diubah menjadi persentase dari modal atau nilai rupiah tetap.
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-4">
                      <label className="text-sm font-black text-slate-700 ml-1">Pilih Model Margin</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button 
                          type="button"
                          onClick={() => setSettings({...settings, profitMarginType: 'percentage'})}
                          className={cn(
                            "flex flex-col items-center justify-center p-5 rounded-[1.5rem] border-2 transition-all space-y-2",
                            settings.profitMarginType === 'percentage' 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100" 
                              : "bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200"
                          )}
                        >
                          <Percent className="w-6 h-6" />
                          <span className="font-black text-xs uppercase tracking-wider">Persentase</span>
                        </button>
                        <button 
                          type="button"
                          onClick={() => setSettings({...settings, profitMarginType: 'nominal'})}
                          className={cn(
                            "flex flex-col items-center justify-center p-5 rounded-[1.5rem] border-2 transition-all space-y-2",
                            settings.profitMarginType === 'nominal' 
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-100" 
                              : "bg-slate-50 border-slate-100 text-slate-500 hover:border-indigo-200"
                          )}
                        >
                          <Banknote className="w-6 h-6" />
                          <span className="font-black text-xs uppercase tracking-wider">Nominal</span>
                        </button>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-sm font-black text-slate-700 ml-1">
                        Nilai Profit Per Barang {settings.profitMarginType === 'percentage' ? '(%)' : '(Rp)'}
                      </label>
                      <div className="relative">
                        {settings.profitMarginType === 'nominal' && (
                          <span className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">Rp</span>
                        )}
                        <input 
                          required
                          type="text"
                          value={formatNumber(settings.profitMarginValue)}
                          onChange={(e) => setSettings({...settings, profitMarginValue: parseNumber(e.target.value)})}
                          className={cn(
                            "w-full py-5 bg-slate-50 border border-slate-100 rounded-[1.5rem] focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none transition-all font-black text-xl text-slate-900",
                            settings.profitMarginType === 'nominal' ? "pl-16 pr-6" : "px-6"
                          )}
                          placeholder="0"
                        />
                        {settings.profitMarginType === 'percentage' && (
                          <span className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 font-black">%</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'security' && (
              <motion.div
                key="security"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-8 space-y-6 text-center py-20">
                  <div className="inline-flex p-4 bg-orange-50 rounded-3xl text-orange-600 mb-4">
                    <ShieldCheck className="w-10 h-10" />
                  </div>
                  <h2 className="text-2xl font-black text-slate-900">Keamanan Sistem</h2>
                  <p className="text-slate-500 max-w-sm mx-auto font-medium leading-relaxed">
                    Fitur autentikasi dan otorisasi multi-tab sedang dalam tahap pengembangan untuk versi berikutnya.
                  </p>
                  <div className="pt-4">
                    <span className="px-4 py-2 bg-slate-100 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-500">
                      Local Storage Mode &bull; v1.0.4
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex pt-4 sticky bottom-6 z-10">
          <button 
            type="submit"
            className="w-full md:w-auto min-w-[240px] flex items-center justify-center px-12 py-5 bg-slate-900 text-white rounded-[2rem] font-black text-lg hover:bg-indigo-600 transition-all shadow-2xl hover:shadow-indigo-200 active:scale-95 space-x-3 group"
          >
            <div className="p-2 bg-white/10 rounded-xl group-hover:bg-white/20 transition-colors">
              <Save className="w-5 h-5 text-white" />
            </div>
            <span>Simpan Pengaturan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
