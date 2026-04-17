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
import { formatNumber, parseNumber } from '../lib/utils';
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

  if (loading || !settings) {
    return (
      <div className="h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Pengaturan</h1>
          <p className="text-slate-500">Sesuaikan profil aplikasi dan parameter bisnis Anda.</p>
        </div>
        <AnimatePresence>
          {showSuccess && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="flex items-center px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl font-medium shadow-sm border border-emerald-200"
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Berhasil disimpan!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Profile Section */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-3">
            <LayoutIcon className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800">Profil Aplikasi</h2>
          </div>
          <div className="p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Nama Aplikasi</label>
              <input 
                required
                type="text"
                value={settings.appName}
                onChange={(e) => setSettings({...settings, appName: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all"
                placeholder="Masukkan nama toko/aplikasi"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Deskripsi Aplikasi</label>
              <textarea 
                rows={3}
                value={settings.appDescription}
                onChange={(e) => setSettings({...settings, appDescription: e.target.value})}
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all resize-none"
                placeholder="Deskripsi singkat mengenai toko Anda"
              />
            </div>
          </div>
        </section>

        {/* Profit Margin Section */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-3">
            <Percent className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800">Margin Profit Global</h2>
          </div>
          <div className="p-6 space-y-6">
            <div className="flex items-start bg-indigo-50 p-4 rounded-xl space-x-3">
              <Info className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
              <p className="text-sm text-indigo-700 leading-relaxed">
                Profit margin ini akan digunakan untuk menghitung harga jual produk secara otomatis ketika Anda memasukkan harga beli (modal) di modul Kelola Produk.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">Tipe Margin</label>
                <div className="flex gap-4">
                  <button 
                    type="button"
                    onClick={() => setSettings({...settings, profitMarginType: 'percentage'})}
                    className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      settings.profitMarginType === 'percentage' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <Percent className="w-4 h-4 mr-2" />
                    <span className="font-bold">Persentase (%)</span>
                  </button>
                  <button 
                    type="button"
                    onClick={() => setSettings({...settings, profitMarginType: 'nominal'})}
                    className={`flex-1 flex items-center justify-center p-3 rounded-xl border-2 transition-all ${
                      settings.profitMarginType === 'nominal' 
                        ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-100' 
                        : 'bg-white border-slate-100 text-slate-500 hover:border-slate-200'
                    }`}
                  >
                    <Banknote className="w-4 h-4 mr-2" />
                    <span className="font-bold">Nominal (Rp)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">
                  Nilai Margin {settings.profitMarginType === 'percentage' ? '(%)' : '(Rp)'}
                </label>
                <div className="relative">
                  {settings.profitMarginType === 'nominal' && (
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">Rp</span>
                  )}
                  <input 
                    required
                    type="text"
                    value={formatNumber(settings.profitMarginValue)}
                    onChange={(e) => setSettings({...settings, profitMarginValue: parseNumber(e.target.value)})}
                    className={`w-full ${settings.profitMarginType === 'nominal' ? 'pl-12' : 'pl-4'} pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all font-bold text-slate-900`}
                    placeholder="0"
                  />
                  {settings.profitMarginType === 'percentage' && (
                    <span className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">%</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center space-x-3">
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
            <h2 className="font-bold text-slate-800">Keamanan</h2>
          </div>
          <div className="p-6">
            <p className="text-sm text-slate-500 italic">Fitur keamanan sistem sedang disiapkan. Data aplikasi Anda saat ini tersimpan secara lokal di peramban ini.</p>
          </div>
        </section>

        <div className="flex pt-4">
          <button 
            type="submit"
            className="w-full md:w-auto flex items-center justify-center px-12 py-3.5 bg-indigo-600 text-white rounded-2xl font-bold hover:bg-indigo-700 transition-all shadow-xl shadow-indigo-200 active:scale-95 space-x-2"
          >
            <Save className="w-5 h-5" />
            <span>Simpan Perubahan</span>
          </button>
        </div>
      </form>
    </div>
  );
}
