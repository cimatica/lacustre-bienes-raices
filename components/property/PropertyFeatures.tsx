type Props = {
  area: number;
  beds: number;
  baths: number;
  garage?: number;
};

export default function PropertyFeatures({ area, beds, baths, garage = 2 }: Props) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
      <h2 className="text-lg font-semibold mb-6 text-nordic">Property Features</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
          <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
          <span className="text-xl font-bold text-nordic">{area}</span>
          <span className="text-xs uppercase tracking-wider text-nordic/50">Square Meters</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
          <span className="material-icons text-mosque text-2xl mb-2">bed</span>
          <span className="text-xl font-bold text-nordic">{beds}</span>
          <span className="text-xs uppercase tracking-wider text-nordic/50">Bedrooms</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
          <span className="material-icons text-mosque text-2xl mb-2">shower</span>
          <span className="text-xl font-bold text-nordic">{baths}</span>
          <span className="text-xs uppercase tracking-wider text-nordic/50">Bathrooms</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-mosque/5 rounded-lg border border-mosque/10">
          <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
          <span className="text-xl font-bold text-nordic">{garage}</span>
          <span className="text-xs uppercase tracking-wider text-nordic/50">Garage</span>
        </div>
      </div>
    </div>
  );
}
