import type { GroceryStore } from '@/types/map';

export async function fetchNearbyGroceryStores(
  lat: number,
  lng: number,
  radiusMeters = 5000,
): Promise<GroceryStore[]> {
  const query = `
    [out:json][timeout:25];
    (
      node["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
      node["shop"="grocery"](around:${radiusMeters},${lat},${lng});
      node["shop"="convenience"](around:${radiusMeters},${lat},${lng});
      node["shop"="food"](around:${radiusMeters},${lat},${lng});
      node["amenity"="marketplace"](around:${radiusMeters},${lat},${lng});
      way["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
      way["shop"="grocery"](around:${radiusMeters},${lat},${lng});
    );
    out center;
  `;

  console.log('Fetching grocery stores near:', lat, lng);

  const res = await fetch('https://overpass-api.de/api/interpreter', {
    method: 'POST',
    body: query,
  });

  console.log('Overpass response status:', res.status);

  if (!res.ok) throw new Error('Failed to fetch grocery stores');

  const data = await res.json();
  console.log('Overpass results:', data.elements.length, 'stores found');

  return data.elements.map((el: any) => ({
    id: el.id,
    name: el.tags?.name ?? 'Unnamed Store',
    lat: el.lat ?? el.center?.lat,
    lng: el.lon ?? el.center?.lon,
  })).filter((s: GroceryStore) => s.lat && s.lng);
}