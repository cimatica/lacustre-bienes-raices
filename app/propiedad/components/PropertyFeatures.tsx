type Props = {
  area: number;
  beds: number;
  baths: number;
  parking?: number;
  dict?: any;
};

export default function PropertyFeatures({ area, beds, baths, parking = 0, dict }: Props) {
  return (
    <div className="bg-surface-dark p-8 rounded-xl shadow-sm border border-slate-700/50">
      <h2 className="text-lg font-semibold mb-6 text-white">{dict?.property?.featuresTitle || "Property Features"}</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="flex flex-col items-center justify-center p-4 bg-surface-darker rounded-lg border border-slate-700/50">
          <span className="material-icons text-mosque text-2xl mb-2">square_foot</span>
          <span className="text-xl font-bold text-white">{area}</span>
          <span className="text-xs uppercase tracking-wider text-slate-400 text-center">{dict?.property?.sqm || "Square Meters"}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-surface-darker rounded-lg border border-slate-700/50">
          <span className="material-icons text-mosque text-2xl mb-2">king_bed</span>
          <span className="text-xl font-bold text-white">{beds}</span>
          <span className="text-xs uppercase tracking-wider text-slate-400 text-center">{dict?.property?.bedrooms || "Bedrooms"}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-surface-darker rounded-lg border border-slate-700/50">
          <span className="material-icons text-mosque text-2xl mb-2">bathtub</span>
          <span className="text-xl font-bold text-white">{baths}</span>
          <span className="text-xs uppercase tracking-wider text-slate-400 text-center">{dict?.property?.bathrooms || "Bathrooms"}</span>
        </div>
        <div className="flex flex-col items-center justify-center p-4 bg-surface-darker rounded-lg border border-slate-700/50">
          <span className="material-icons text-mosque text-2xl mb-2">directions_car</span>
          <span className="text-xl font-bold text-white">{parking}</span>
          <span className="text-xs uppercase tracking-wider text-slate-400 text-center">{dict?.property?.parking || "Parking"}</span>
        </div>
      </div>
    </div>
  );
}
