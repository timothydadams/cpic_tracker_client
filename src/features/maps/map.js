import React, { useRef, useEffect, useState, useReducer } from 'react';
import mapboxgl from '!mapbox-gl'; // eslint-disable-line import/no-webpack-loader-syntax
import { Text } from '../../components/catalyst/text.jsx';
import { Button } from '../../components/catalyst/button.jsx';
import { stateReducer } from 'utils/helpers.js';
mapboxgl.accessToken = process.env.MAP_BOX_KEY;

export const Map = ({
  coords,
  updateLocation,
  sourceLocations,
  disableBtn = false,
  ...props
}) => {
  const { latitude, longitude } = coords;

  if (!latitude || !longitude) return null;

  const mapContainer = useRef(null);
  const map = useRef(null);
  const [lng, setLng] = useState(longitude);
  const [lat, setLat] = useState(latitude);
  const [zoom, setZoom] = useState(12);

  const [marker, updateMarker] = useReducer(stateReducer, {
    latitude,
    longitude,
  });

  useEffect(() => {
    if (map.current) return; // initialize map only once
    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: `mapbox://styles/mapbox/outdoors-v12`, //'mapbox://styles/mapbox/streets-v12',
      center: [lng, lat],
      zoom: zoom,
    });

    map.current.addControl(
      new mapboxgl.ScaleControl({
        maxWidth: 200,
      })
    );

    const marker = new mapboxgl.Marker({
      draggable: true,
    })
      .setLngLat([lng, lat])
      .addTo(map.current);

    marker.on('dragend', onDragEnd);

    map.current.on('move', () => {
      setLng(map.current.getCenter().lng.toFixed(4));
      setLat(map.current.getCenter().lat.toFixed(4));
      setZoom(map.current.getZoom().toFixed(2));
    });

    function onDragEnd() {
      const { lng, lat } = marker.getLngLat();
      updateMarker({ latitude: lat, longitude: lng });
      // move map to where the marker is dragged
      map.current.flyTo({
        center: [lng, lat],
        essential: false, // this animation is considered essential with respect to prefers-reduced-motion
      });
    }

    map.current.on('load', () => {
      // Add a data source containing GeoJSON data.
      if (sourceLocations) {
        map.current.addSource('points', sourceLocations);

        // Add a new layer to visualize the polygon.
        map.current.addLayer({
          id: 'points',
          type: 'circle',
          source: 'points', // reference the data source
          paint: {
            'circle-radius': 4,
            'circle-stroke-width': 2,
            'circle-color': 'yellow',
            'circle-stroke-color': 'black',
          },
        });
      }
    });
  });

  useEffect(() => {
    if (map.current && latitude && longitude) {
      map.current.flyTo({
        center: [longitude, latitude],
        essential: false, // this animation is considered essential with respect to prefers-reduced-motion
      });
    }
  }, [latitude, longitude]);

  return (
    <div className='relative my-4'>
      <div className='absolute text-zinc-400 w-full flex justify-between font-mono px-2 py-3 z-10 top-0 left-0 bg-opacity-80 bg-black'>
        <div>
          Longitude: {lng} | Latitude: {lat} | Zoom: {zoom}
        </div>
        <div>
          <Button
            outline
            className='dark'
            onClick={() => updateLocation(marker)}
            disabled={disableBtn === true}
          >
            Update Location
          </Button>
        </div>
      </div>
      <div className='h-[26rem]' ref={mapContainer} />
    </div>
  );
};
