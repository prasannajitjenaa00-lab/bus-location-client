const config = {
  apiUrl: import.meta.env.VITE_API_URL || '',
  mapTileUrl: import.meta.env.VITE_MAP_TILE_LAYER_URL || 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  geocodingUrl: import.meta.env.VITE_GEOCODING_API_URL || 'https://nominatim.openstreetmap.org/reverse',
  defaultAvatar: import.meta.env.VITE_DEFAULT_AVATAR_URL || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=250',
};

export default config;
