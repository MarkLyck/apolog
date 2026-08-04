"use client";

import * as maplibregl from "maplibre-gl";
import type { Map as MapLibreMap } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";
import { FiMapPin, FiX } from "react-icons/fi";

export interface MapEntry {
  slug: string;
  title: string;
  summary: string;
  type: string;
  period: string;
  certainty: string;
  longitude: number;
  latitude: number;
  comparison: string;
}

function addEntryMarker(
  map: MapLibreMap,
  entry: MapEntry,
  selectEntry: (entry: MapEntry) => void
) {
  const element = document.createElement("button");
  element.className = "apolog-map-marker";
  element.type = "button";
  element.setAttribute("aria-label", `Open ${entry.title}`);
  const openEntry = () => selectEntry(entry);
  element.addEventListener("click", openEntry);
  const marker = new maplibregl.Marker({ element })
    .setLngLat([entry.longitude, entry.latitude])
    .addTo(map);
  return () => {
    element.removeEventListener("click", openEntry);
    marker.remove();
  };
}

export function MapExplorer({ entries }: { entries: MapEntry[] }) {
  const mapElement = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapLibreMap | null>(null);
  const [selected, setSelected] = useState<MapEntry | null>(entries[0] ?? null);

  useEffect(() => {
    if (!mapElement.current || mapRef.current) {
      return;
    }
    const map = new maplibregl.Map({
      attributionControl: false,
      center: [35, 29],
      container: mapElement.current,
      style:
        process.env.NEXT_PUBLIC_MAP_STYLE_URL ||
        "https://tiles.openfreemap.org/styles/positron",
      zoom: 3,
    });
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: false }),
      "top-right"
    );
    map.addControl(new maplibregl.AttributionControl({ compact: true }));
    const removeMarkers = entries.map((entry) =>
      addEntryMarker(map, entry, setSelected)
    );
    mapRef.current = map;
    return () => {
      for (const removeMarker of removeMarkers) {
        removeMarker();
      }
      map.remove();
      mapRef.current = null;
    };
  }, [entries]);

  const chooseEntry = (entry: MapEntry) => {
    setSelected(entry);
    mapRef.current?.flyTo({
      center: [entry.longitude, entry.latitude],
      duration: 900,
      zoom: 6,
    });
  };

  return (
    <div className="grid overflow-hidden rounded-[1.7rem] border border-[var(--line)] bg-[var(--surface)] lg:grid-cols-[minmax(0,1fr)_23rem]">
      <div className="relative min-h-[34rem]" ref={mapElement} />
      <div className="border-t border-[var(--line)] p-5 lg:border-l lg:border-t-0">
        {selected ? (
          <div>
            <div className="flex items-start justify-between gap-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[var(--accent-strong)]">
                {selected.type} · {selected.certainty}
              </div>
              <button
                aria-label="Close selected entry"
                className="grid size-8 place-items-center rounded-full hover:bg-[var(--surface-strong)]"
                onClick={() => setSelected(null)}
                type="button"
              >
                <FiX aria-hidden="true" />
              </button>
            </div>
            <h2 className="mt-5 text-3xl">{selected.title}</h2>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              {selected.summary}
            </p>
            <dl className="mt-6 grid gap-4 border-y border-[var(--line)] py-5 text-sm">
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                  Period
                </dt>
                <dd className="mt-1 font-semibold">{selected.period}</dd>
              </div>
              <div>
                <dt className="text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
                  Coordinates
                </dt>
                <dd className="mt-1 font-semibold">
                  {selected.latitude.toFixed(3)},{" "}
                  {selected.longitude.toFixed(3)}
                </dd>
              </div>
            </dl>
            <h3 className="mt-6 font-sans text-xs font-bold uppercase tracking-wide text-[var(--muted)]">
              Comparison note
            </h3>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {selected.comparison}
            </p>
          </div>
        ) : (
          <div className="grid min-h-64 place-items-center text-center">
            <div>
              <FiMapPin
                aria-hidden="true"
                className="mx-auto text-2xl text-[var(--accent)]"
              />
              <p className="mt-3 text-sm text-[var(--muted)]">
                Select a map marker or list entry.
              </p>
            </div>
          </div>
        )}
        <div className="mt-6 grid gap-2 border-t border-[var(--line)] pt-5">
          {entries.map((entry) => (
            <button
              aria-pressed={selected?.slug === entry.slug}
              className="rounded-xl px-3 py-3 text-left text-sm font-semibold hover:bg-[var(--surface-strong)] aria-pressed:bg-[var(--surface-strong)]"
              key={entry.slug}
              onClick={() => chooseEntry(entry)}
              type="button"
            >
              {entry.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
