import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut, Calendar, AlertTriangle } from 'lucide-react';
import InventoryManager from './InventoryManager';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'parts' | 'machines'>('parts');
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-gradient-to-r from-orange-500 to-green-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-md">
                <span className="text-orange-600 text-xl font-bold">BKE</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold">BALAKRISHNA ENGINEERING</h1>
                <p className="text-sm text-orange-100">Administrator Portal</p>
              </div>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="w-4 h-4" />
                <span>{currentDate}</span>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-6 h-6 text-orange-600" />
            <h2 className="text-xl font-bold text-gray-800">BALAKRISHNA INVENTORY</h2>
          </div>
          <p className="text-sm text-gray-600">
            Welcome, <span className="font-semibold text-orange-600">{user?.username}</span>.
            You have full access to manage all inventory items.
          </p>
        </div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="border-b border-gray-200">
            <div className="flex">
              <button
                onClick={() => setActiveTab('parts')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'parts'
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Spare Parts
              </button>
              <button
                onClick={() => setActiveTab('machines')}
                className={`flex-1 px-6 py-4 font-semibold transition ${
                  activeTab === 'machines'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                Machines
              </button>
            </div>
          </div>

          <div className="p-6">
            <InventoryManager type={activeTab} isAdmin={true} />
          </div>
        </div>
      </div>
    </div>
  );
}
