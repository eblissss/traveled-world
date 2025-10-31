import React, { useState } from 'react';
import { motion } from 'framer-motion';
import type { City } from '../../types/city';
import { useCityPhoto } from '../../lib/photoService';
import { CityDeleteModal } from '../input/CityDeleteModal';

interface CityDetailsPanelProps {
  city: City | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: () => void;
}


export function CityDetailsPanel({ city, isOpen, onClose, onEdit }: CityDetailsPanelProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Use the photo service hook for real city photos
  const { photo: cityPhoto, loading: isLoadingPhoto } = useCityPhoto(city!);

  if (!city) return null;

  const handleDelete = () => {
    setShowDeleteModal(true);
  };

  const handleGoogleSearch = () => {
    const query = encodeURIComponent(`${city.name} ${city.country}`);
    window.open(`https://www.google.com/search?q=${query}`, '_blank');
  };

  const formatPopulation = (pop?: number) => {
    if (!pop) return '';
    if (pop >= 1000000) return `${(pop / 1000000).toFixed(1)}M`;
    if (pop >= 1000) return `${(pop / 1000).toFixed(0)}K`;
    return pop.toLocaleString();
  };


  return (
    <>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{
              type: 'tween',
              duration: 0.4,
              ease: [0.4, 0, 0.2, 1] // cubic-bezier equivalent
            }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-sm glass shadow-xl z-50 overflow-y-auto"
            style={{
              background: 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.9) 100%)',
              fontFamily: 'Inter, system-ui, sans-serif'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with photo */}
            <div className="relative h-36 sm:h-40 overflow-hidden rounded-t-xl">
              {isLoadingPhoto ? (
                <div className="w-full h-full bg-gradient-to-r from-[var(--bg-secondary)] via-[var(--border-color)] to-[var(--bg-secondary)] bg-[length:200%_100%] animate-[loading_1.5s_infinite] flex items-center justify-center">
                  <div className="text-2xl opacity-50">📸</div>
                </div>
              ) : cityPhoto ? (
                <>
                  <img
                    src={cityPhoto.url}
                    alt={`${city.name} skyline`}
                    className="w-full h-full object-cover brightness-90 contrast-110"
                  />
                  {/* Photo attribution */}
                  <div className="absolute bottom-2 right-2 bg-black/60 text-white px-2 py-1 rounded text-xs font-medium">
                    {cityPhoto.source}
                  </div>
                </>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-[var(--accent-primary)] to-[color-mix(in_srgb,var(--accent-primary)_70%,black)] flex items-center justify-center">
                  <div className="text-lg opacity-80">🏙️</div>
                </div>
              )}

              {/* Overlay gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-black/10 to-black/40" />

              {/* Close button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="absolute top-3 right-3 w-8 h-8 bg-white/90 backdrop-blur-sm border-none cursor-pointer flex items-center justify-center text-base rounded-full shadow-lg hover:shadow-xl transition-shadow"
              >
                ✕
              </motion.button>

              {/* City info overlay */}
              <div className="absolute bottom-3 left-4 right-4 text-white">
                <h2 className="text-xl font-bold m-0 mb-1 drop-shadow-lg">
                  {city.name}
                </h2>
                <p className="text-sm m-0 opacity-90 drop-shadow-md">
                  {city.country}{city.adminName ? `, ${city.adminName}` : ''}
                </p>
              </div>
            </div>

            {/* Content */}
            <div className="p-5 space-y-4">
              {/* Status badges and actions */}
              <div className="flex items-center justify-between">
                <div className="flex flex-wrap gap-2 items-center">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.1 }}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wide text-white shadow-sm flex items-center gap-1.5 ${
                      city.type === 'visited'
                        ? 'bg-gradient-to-r from-[var(--accent-visited)] to-[color-mix(in_srgb,var(--accent-visited)_80%,white)]'
                        : 'bg-gradient-to-r from-[var(--accent-lived)] to-[color-mix(in_srgb,var(--accent-lived)_80%,white)]'
                    }`}
                  >
                    {city.type === 'visited' ? '✈️ Visited' : '🏠 Lived'}
                  </motion.span>

                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2 }}
                    onClick={handleGoogleSearch}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:bg-white hover:shadow-md transition-all"
                    title="Search on Google"
                  >
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                  </motion.button>
                </div>

                <div className="flex gap-2">
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={onEdit}
                    className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm border border-[rgba(0,0,0,0.1)] flex items-center justify-center cursor-pointer hover:bg-white hover:shadow-md transition-all"
                    title="Edit City"
                  >
                    ✏️
                  </motion.button>
                  <motion.button
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4 }}
                    onClick={handleDelete}
                    className="w-8 h-8 rounded-full bg-red-500/90 backdrop-blur-sm border border-red-600/20 flex items-center justify-center cursor-pointer hover:bg-red-500 hover:shadow-md transition-all"
                    title="Delete City"
                  >
                    🗑️
                  </motion.button>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {city.population && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="p-3 rounded-xl bg-[rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.05)] hover:shadow-sm transition-shadow"
                  >
                    <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                      {formatPopulation(city.population)}
                    </div>
                    <div className="text-xs text-[var(--text-secondary)] font-medium">
                      Population
                    </div>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="p-3 rounded-xl bg-[rgba(0,0,0,0.02)] border border-[rgba(0,0,0,0.05)] hover:shadow-sm transition-shadow"
                >
                  <div className="text-2xl font-bold text-[var(--text-primary)] mb-1">
                    {new Date(city.lastVisited).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                  </div>
                  <div className="text-xs text-[var(--text-secondary)] font-medium">
                    Last Visit
                  </div>
                </motion.div>
              </div>


              {/* Additional information */}
              <div className="grid gap-2 text-sm text-[var(--text-secondary)]">
                <div>📅 Added: {new Date(city.dateAdded).toLocaleDateString()}</div>
                <div>🗺️ Coordinates: {city.coordinates[0].toFixed(4)}, {city.coordinates[1].toFixed(4)}</div>
              </div>


            </div>

            <style>{`
              @keyframes loading {
                0% { background-position: -200% 0; }
                100% { background-position: 200% 0; }
              }
              @keyframes pulse {
                0%, 100% { opacity: 0.5; }
                50% { opacity: 1; }
              }

              /* Dark theme overrides for the panel */
              @media (prefers-color-scheme: dark) {
                .glass {
                  background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.9) 100%) !important;
                  border: 1px solid rgba(255, 255, 255, 0.1) !important;
                }
              }
            `}</style>
          </motion.div>
        </>
      )}

      <CityDeleteModal
        city={city}
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
      />
    </>
  );
}

