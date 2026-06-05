export default function PropertyAmenities() {
  const amenities = [
    "Smart Home System",
    "Swimming Pool",
    "Central Heating & Cooling",
    "Electric Vehicle Charging",
    "Private Gym",
    "Wine Cellar",
  ];

  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
      <h2 className="text-lg font-semibold mb-6 text-nordic">Amenities</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8">
        {amenities.map((item, i) => (
          <div key={i} className="flex items-center gap-3 text-nordic/70">
            <span className="material-icons text-mosque/60 text-sm">check_circle</span>
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
