import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';
import type { PublicServiceArea } from './ServiceArea';

// Fix basic leaflet icon issue in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const dfwCenter: [number, number] = [32.85, -96.95];

const knownCityCoordinates: Record<string, [number, number]> = {
  "Dallas": [32.7767, -96.7970],
  "Irving": [32.8140, -96.9489],
  "Plano": [33.0198, -96.6989],
  "Arlington": [32.7357, -97.1081],
  "Frisco": [33.1507, -96.8236],
  "McKinney": [33.1976, -96.6154],
  "Fort Worth": [32.7254, -97.3208],
  "Garland": [32.9126, -96.6389],
  "Mesquite": [32.7668, -96.5992],
  "Grand Prairie": [32.7460, -96.9978]
};

interface ServiceMapProps {
  areas: PublicServiceArea[];
  loading?: boolean;
}

interface GeocodedArea extends PublicServiceArea {
  coords: [number, number];
}

const ServiceMap = ({ areas, loading: parentLoading }: ServiceMapProps) => {
  const [geocodedAreas, setGeocodedAreas] = useState<GeocodedArea[]>([]);
  const [loadingCoords, setLoadingCoords] = useState(false);

  useEffect(() => {
    if (!areas || areas.length === 0) {
      setGeocodedAreas([]);
      return;
    }

    let isMounted = true;
    const fetchCoords = async () => {
      setLoadingCoords(true);
      const results: GeocodedArea[] = [];

      for (const area of areas) {
        if (knownCityCoordinates[area.city]) {
          results.push({ ...area, coords: knownCityCoordinates[area.city] });
          continue;
        }

        try {
          // Prevent rate limiting (Nominatim limit is 1 req/sec)
          await new Promise(r => setTimeout(r, 1000));
          const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(area.city)},+TX&limit=1`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.length > 0) {
               results.push({ ...area, coords: [parseFloat(data[0].lat), parseFloat(data[0].lon)] });
            }
          }
        } catch (e) {
          console.error("Geocoding failed for", area.city);
        }
      }

      if (isMounted) {
        setGeocodedAreas(results);
        setLoadingCoords(false);
      }
    };

    fetchCoords();
    return () => { isMounted = false; };
  }, [areas]);

  const isLoading = parentLoading || loadingCoords;

  return (
    <div className="w-full aspect-video md:aspect-square lg:aspect-video rounded-[2.5rem] overflow-hidden shadow-2xl border-8 border-white relative bg-slate-100 z-10 flex">
      {isLoading && (
         <div className="absolute inset-0 bg-white/50 backdrop-blur-sm z-[500] flex items-center justify-center">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
         </div>
      )}
      
      <MapContainer 
        center={dfwCenter} 
        zoom={9.5} 
        style={{ width: '100%', height: '100%', zIndex: 1 }}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        
        {geocodedAreas.map((area) => (
           <React.Fragment key={area.city}>
               <Circle 
                   center={area.coords} 
                   radius={8000} /* roughly 5 miles */
                   pathOptions={{ color: '#127117', fillColor: '#127117', fillOpacity: 0.15, weight: 2 }}
               />
               <Marker position={area.coords}>
                 <Popup>{area.city}, TX</Popup>
               </Marker>
           </React.Fragment>
        ))}
      </MapContainer>
      
      {/* Overlay Badge */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[400] pointer-events-none">
        <div className="px-6 py-3 bg-white/90 backdrop-blur shadow-2xl rounded-2xl text-center border border-white whitespace-nowrap">
          <p className="font-bold text-ink flex items-center gap-2 text-sm">
            <span className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse"></span>
            {geocodedAreas.length > 0 ? `${geocodedAreas.length} Active Zones` : 'DFW Service Hub'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default ServiceMap;
