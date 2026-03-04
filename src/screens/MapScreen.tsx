import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { db } from '../lib/db';
import { Household, Person } from '../types';
import { useState } from 'react';

function PinDropper({ onDrop }: { onDrop: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onDrop(e.latlng.lat, e.latlng.lng) });
  return null;
}

export function MapScreen({ households, people }: { households: Household[]; people: Person[] }) {
  const [target, setTarget] = useState<string>('');
  const peopleById = new Map(people.map((p) => [p.id, p]));
  const mapped = households.filter((h) => typeof h.lat === 'number' && typeof h.lng === 'number');
  const notMapped = households.filter((h) => typeof h.lat !== 'number' || typeof h.lng !== 'number');

  return (
    <div className="space-y-3 pb-20">
      <div className="card h-[420px] p-0 overflow-hidden">
        <MapContainer center={[-0.65, 73.15]} zoom={13} className="h-full w-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <PinDropper
            onDrop={(lat, lng) => {
              if (!target) return;
              db.households.update(target, { lat, lng });
              const members = households.find((h) => h.householdKey === target)?.memberIds ?? [];
              members.forEach((id) => db.people.update(id, { lat, lng }));
              setTarget('');
            }}
          />
          <MarkerClusterGroup chunkedLoading>
            {mapped.map((h) => (
              <Marker key={h.householdKey} position={[h.lat!, h.lng!]}>
                <Popup>
                  <div className="text-sm">
                    <p className="font-semibold">{h.houseName}</p>
                    <p>{h.householdStatus}</p>
                    <ul>
                      {h.memberIds.slice(0, 6).map((id) => (
                        <li key={id}>{peopleById.get(id)?.fullName}</li>
                      ))}
                    </ul>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
      <div className="card">
        <p className="font-semibold">Not mapped queue ({notMapped.length})</p>
        <select className="input mt-2" value={target} onChange={(e) => setTarget(e.target.value)}>
          <option value="">Select household then tap map to pin</option>
          {notMapped.map((h) => (
            <option key={h.householdKey} value={h.householdKey}>{h.island} - {h.houseName}</option>
          ))}
        </select>
      </div>
    </div>
  );
}
