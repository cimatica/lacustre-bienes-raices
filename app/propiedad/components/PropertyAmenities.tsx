export default function PropertyAmenities({ dict, amenities: propAmenities }: { dict?: any, amenities?: string[] }) {
  const defaultAmenities = [
    "Smart Home System",
    "Swimming Pool",
    "Central Heating & Cooling",
    "Electric Vehicle Charging",
    "Private Gym",
    "Wine Cellar",
  ];

  const amenitiesToUse: string[] = propAmenities && propAmenities.length > 0 ? propAmenities : (dict?.property?.amenityList || defaultAmenities);

  return (
    <div className="bg-surface-dark p-8 rounded-xl shadow-sm border border-slate-700/50">
      <h2 className="text-lg font-semibold mb-6 text-white">{dict?.property?.amenitiesTitle || "Amenities"}</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        {amenitiesToUse.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-slate-300">
            <span className="material-icons text-mosque/60 text-sm">check_circle</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
