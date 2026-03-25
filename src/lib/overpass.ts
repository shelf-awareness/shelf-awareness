export interface GroceryStore {
  id: number;
  name: string;
  lat: number;
  lng: number;
}

export async function fetchNearbyGroceryStores(
  lat: number,
  lng: number,
  radiusMeters = 10000,
): Promise<GroceryStore[]> {
  const query = `
    [out:json][timeout:10];
    (
      node["shop"="supermarket"](around:${radiusMeters},${lat},${lng});
      node["shop"="grocery"](around:${radiusMeters},${lat},${lng});
      node["shop"="convenience"](around:${radiusMeters},${lat},${lng});
    );
    out body;
  `;

  try {
    const res = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.elements
      .filter((el: any) => el.tags?.name)
      .map((el: any) => ({
        id: el.id,
        name: el.tags.name,
        lat: el.lat,
        lng: el.lon,
      }));
  } catch {
    return [];
  }
}