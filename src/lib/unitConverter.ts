//type Unit = 'kg' | 'g' | 'lb' | 'oz' | 'pcs' | 'ml' | 'l' | 'Other';

export function convertUnits(quantity: number, fromUnit: String | null, toUnit: String | null): number {
  if (fromUnit === toUnit) return quantity;

  // Block cross-category conversions (mass ↔ volume ↔ count ↔ other)
  const mass = new Set<String | null>(['kg', 'g', 'lb', 'oz']);
  const volume = new Set<String | null>(['ml', 'l']);
  const count = new Set<String | null>(['pcs']);
  const other = new Set<String | null>(['Other']);

  const sameCategory =
    (mass.has(fromUnit) && mass.has(toUnit)) ||
    (volume.has(fromUnit) && volume.has(toUnit)) ||
    (count.has(fromUnit) && count.has(toUnit)) ||
    (other.has(fromUnit) && other.has(toUnit));

  if (!sameCategory) {
    throw new Error(`Incompatible units: ${fromUnit} -> ${toUnit}`);
  }

  switch (fromUnit) {
    case 'kg':
      if (toUnit === 'g') return quantity * 1000;
      if (toUnit === 'lb') return quantity * 2.20462262185;
      if (toUnit === 'oz') return quantity * 35.27396195;
      break;

    case 'g':
      if (toUnit === 'kg') return quantity / 1000;
      if (toUnit === 'lb') return quantity / 453.59237; 
      if (toUnit === 'oz') return quantity / 28.349523125;
      break;

    case 'lb':
      if (toUnit === 'kg') return quantity / 2.20462262185;
      if (toUnit === 'g') return quantity * 453.59237;
      if (toUnit === 'oz') return quantity * 16;
      break;

    case 'oz':
      if (toUnit === 'kg') return quantity / 35.27396195;
      if (toUnit === 'g') return quantity * 28.349523125;
      if (toUnit === 'lb') return quantity / 16;
      break; 

    case 'ml':
      if (toUnit === 'l') return quantity / 1000;
      break;

    case 'l':
      if (toUnit === 'ml') return quantity * 1000;
      break;

    case 'pcs':
    case 'Other':
      break;
  }

  throw new Error(`Conversion not supported: ${fromUnit} -> ${toUnit}`);
}
