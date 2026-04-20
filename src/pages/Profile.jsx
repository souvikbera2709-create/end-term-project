import React, { useRef } from 'react';
import { useUserProgress } from '../context/UserProgressContext';
import { Camera, Save, UserCircle } from 'lucide-react';

export default function Profile() {
  const { userProfile, setUserProfile } = useUserProgress();
  const fileInputRef = useRef(null);

  const handlePhotoUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUserProfile({ ...userProfile, photoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (field, value) => {
    setUserProfile(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <UserCircle className="text-blue-500" size={32} />
          Your Profile
        </h1>
        <p className="text-gray-400 mt-2">Manage your fitness metrics and account details.</p>
      </div>

      <div className="bg-[#1e1e1e] border border-gray-800 rounded-2xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.12)]">
        <div className="flex flex-col md:flex-row gap-12 items-start">
          
          {/* Avatar Section */}
          <div className="flex flex-col items-center gap-4">
            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-32 h-32 rounded-full border-4 border-blue-600/30 overflow-hidden bg-[#252525] flex items-center justify-center relative shadow-lg">
                {userProfile.photoUrl ? (
                  <img src={userProfile.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <Camera size={40} className="text-gray-500" />
                )}
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera size={28} className="text-white" />
                </div>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handlePhotoUpload}
              accept="image/*"
              className="hidden"
            />
            <div className="text-center">
              <h3 className="text-xl font-bold text-white">{userProfile.name || 'Athlete'}</h3>
              <p className="text-xs text-gray-500 mt-1">Click image to update</p>
            </div>
          </div>

          {/* Form Section */}
          <div className="flex-1 space-y-6 w-full">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Full Name</label>
              <input
                type="text"
                value={userProfile.name}
                onChange={e => handleChange('name', e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full bg-[#252525] border border-gray-700 text-white rounded-xl p-4 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Age</label>
                <input
                  type="number"
                  value={userProfile.age}
                  onChange={e => handleChange('age', e.target.value)}
                  placeholder="e.g. 25"
                  className="w-full bg-[#252525] border border-gray-700 text-white rounded-xl p-4 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Gender</label>
                <select
                  value={userProfile.gender}
                  onChange={e => handleChange('gender', e.target.value)}
                  className="w-full bg-[#252525] border border-gray-700 text-white rounded-xl p-4 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Height (cm)</label>
                <input
                  type="number"
                  value={userProfile.height}
                  onChange={e => handleChange('height', e.target.value)}
                  placeholder="e.g. 175"
                  className="w-full bg-[#252525] border border-gray-700 text-white rounded-xl p-4 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Current Weight (kg)</label>
                <input
                  type="number"
                  value={userProfile.currentWeight}
                  onChange={e => handleChange('currentWeight', e.target.value)}
                  placeholder="e.g. 75"
                  className="w-full bg-[#252525] border border-gray-700 text-white rounded-xl p-4 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Target Weight (kg)</label>
                <input
                  type="number"
                  value={userProfile.targetWeight}
                  onChange={e => handleChange('targetWeight', e.target.value)}
                  placeholder="e.g. 70"
                  className="w-full bg-[#252525] border border-gray-700 text-white rounded-xl p-4 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Activity Level</label>
              <select
                value={userProfile.activityLevel}
                onChange={e => handleChange('activityLevel', e.target.value)}
                className="w-full bg-[#252525] border border-gray-700 text-white rounded-xl p-4 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              >
                <option value="Sedentary">Sedentary (Office job, little exercise)</option>
                <option value="Light">Light (1-3 days/week)</option>
                <option value="Moderate">Moderate (3-5 days/week)</option>
                <option value="Active">Active (6-7 days/week)</option>
                <option value="Very Active">Very Active (Physical job + training)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-8 pt-6 border-t border-gray-800 flex justify-end">
          <button 
            className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95"
            onClick={() => {
              // Simple success indicator logic could go here
              alert("Profile saved successfully!");
            }}
          >
            <Save size={20} />
            Save Profile
          </button>
        </div>
      </div>
    </div>
  );
}
