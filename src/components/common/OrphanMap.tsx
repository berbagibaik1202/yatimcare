import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { Child, OrphanCategory } from '../../types';
import { MapPin, Filter, Users, ShieldCheck, Eye, EyeOff } from 'lucide-react';

interface OrphanMapProps {
  childrenData: Child[];
  onSelectChild?: (child: Child) => void;
  showSensitiveData?: boolean;
}

export const OrphanMap: React.FC<OrphanMapProps> = ({
  childrenData,
  onSelectChild,
  showSensitiveData = false
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.LayerGroup | null>(null);

  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterDistrict, setFilterDistrict] = useState<string>('all');

  // Districts list for filtering
  const districts = Array.from(new Set(childrenData.map(c => c.district))).filter(Boolean);

  const filteredChildren = childrenData.filter(child => {
    if (filterCategory !== 'all' && child.orphanCategory !== filterCategory) return false;
    if (filterDistrict !== 'all' && child.district !== filterDistrict) return false;
    return true;
  });

  // Category counts
  const yatimCount = childrenData.filter(c => c.orphanCategory === 'yatim').length;
  const piatuCount = childrenData.filter(c => c.orphanCategory === 'piatu').length;
  const yatimPiatuCount = childrenData.filter(c => c.orphanCategory === 'yatim_piatu').length;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      // Default center around Sumedang / Jawa Barat
      const map = L.map(mapContainerRef.current, {
        center: [-6.835, 107.93],
        zoom: 11,
        zoomControl: true
      });

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      markersGroupRef.current = L.layerGroup().addTo(map);
      mapInstanceRef.current = map;
    }

    const markersGroup = markersGroupRef.current;
    if (markersGroup) {
      markersGroup.clearLayers();

      filteredChildren.forEach(child => {
        if (!child.latitude || !child.longitude) return;

        // Distinct icon color per category
        let colorClass = '#059669'; // Emerald for Yatim
        if (child.orphanCategory === 'piatu') colorClass = '#2563eb'; // Blue
        if (child.orphanCategory === 'yatim_piatu') colorClass = '#dc2626'; // Red

        const customIcon = L.divIcon({
          className: 'custom-map-marker',
          html: `<div style="background-color: ${colorClass}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
            ${child.orphanCategory === 'yatim' ? 'Y' : child.orphanCategory === 'piatu' ? 'P' : 'YP'}
          </div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14]
        });

        // Mask name and NIK for public
        const displayName = showSensitiveData ? child.fullName : `${child.nickname} (${child.educationLevel})`;
        const addressText = showSensitiveData ? child.address : `Kecamatan ${child.district}, Kabupaten ${child.city}`;

        const popupContent = `
          <div style="font-family: system-ui, sans-serif; padding: 4px; max-width: 200px;">
            <div style="display: flex; items-center; gap: 8px; margin-bottom: 6px;">
              <img src="${child.photoUrl}" style="width: 40px; height: 40px; border-radius: 8px; object-fit: cover;" />
              <div>
                <strong style="font-size: 13px; color: #0f172a;">${displayName}</strong>
                <p style="font-size: 11px; color: #64748b; margin: 0;">${child.schoolName}</p>
              </div>
            </div>
            <p style="font-size: 11px; color: #334155; margin: 4px 0;"><strong>Kategori:</strong> <span style="text-transform: uppercase;">${child.orphanCategory.replace('_', ' ')}</span></p>
            <p style="font-size: 11px; color: #334155; margin: 4px 0;"><strong>Lokasi:</strong> ${addressText}</p>
            <span style="display: inline-block; font-size: 10px; background: #ecfdf5; color: #047857; padding: 2px 6px; border-radius: 4px; font-weight: 600;">Status ${child.status.toUpperCase()}</span>
          </div>
        `;

        const marker = L.marker([child.latitude, child.longitude], { icon: customIcon })
          .bindPopup(popupContent);

        if (onSelectChild) {
          marker.on('click', () => onSelectChild(child));
        }

        markersGroup.addLayer(marker);
      });

      // Adjust map view if markers exist
      if (filteredChildren.length > 0 && mapInstanceRef.current) {
        const bounds = L.latLngBounds(
          filteredChildren.map(c => [c.latitude, c.longitude] as [number, number])
        );
        mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50], maxZoom: 13 });
      }
    }
  }, [filteredChildren, showSensitiveData]);

  return (
    <div className="bg-[#161616] rounded-[32px] p-6 sm:p-8 shadow-2xl border border-white/10 text-white space-y-6">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-[#CCFF00] text-black">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-sans font-black text-xl text-white">Peta Sebaran Penerima Bantuan</h3>
          </div>
          <p className="text-xs text-white/50 mt-1">
            Visualisasi pemetaan lokasi rumah anak yatim, piatu, dan yatim piatu terverifikasi.
          </p>
        </div>

        {/* Legend / Stats Badges */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <div className="px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            Yatim ({yatimCount})
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
            Piatu ({piatuCount})
          </div>
          <div className="px-3.5 py-1.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 font-bold flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            Yatim Piatu ({yatimPiatuCount})
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="py-2 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5 text-white/60 font-medium">
            <Filter className="w-4 h-4 text-[#CCFF00]" />
            <span>Filter Kategori:</span>
          </div>
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-[#222222] text-white font-semibold focus:ring-2 focus:ring-[#CCFF00] focus:outline-hidden"
          >
            <option value="all">Semua Kategori</option>
            <option value="yatim">Yatim (Ayah Meninggal)</option>
            <option value="piatu">Piatu (Ibu Meninggal)</option>
            <option value="yatim_piatu">Yatim Piatu (Keduanya)</option>
          </select>

          <select
            value={filterDistrict}
            onChange={(e) => setFilterDistrict(e.target.value)}
            className="px-3.5 py-2 rounded-xl border border-white/10 bg-[#222222] text-white font-semibold focus:ring-2 focus:ring-[#CCFF00] focus:outline-hidden"
          >
            <option value="all">Semua Kecamatan</option>
            {districts.map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Protection Notice */}
        <div className="flex items-center gap-1.5 text-white/60 bg-white/5 border border-white/10 px-3.5 py-1.5 rounded-xl">
          {showSensitiveData ? (
            <>
              <Eye className="w-3.5 h-3.5 text-[#CCFF00]" />
              <span className="font-bold text-[#CCFF00]">Akses Pengurus (Data Unmasked)</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5 text-white/60" />
              <span>Titik Diacak & Identitas Terproteksi</span>
            </>
          )}
        </div>
      </div>

      {/* Map Element */}
      <div className="relative w-full h-[450px] rounded-2xl overflow-hidden border border-white/10 shadow-inner z-10">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      {/* Footer Info */}
      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
        <p>Menampilkan {filteredChildren.length} titik lokasi anak dari total {childrenData.length} data terdaftar.</p>
        <p className="font-bold text-[#CCFF00]">OpenStreetMap & Leaflet Digital Mapping</p>
      </div>

    </div>
  );
};
