type Props = {
  description?: string;
  dict?: any;
};

export default function PropertyDescription({ description, dict }: Props) {
  return (
    <div className="bg-surface-dark p-8 rounded-xl shadow-sm border border-slate-700/50">
      <h2 className="text-lg font-semibold mb-4 text-white">{dict?.property?.aboutHome || "About this home"}</h2>
      <div className="prose prose-slate max-w-none text-slate-300 leading-relaxed">
        {description ? (
          <p>{description}</p>
        ) : (
          <>
            <p className="mb-4">
              {dict?.property?.descP1 || "Experience modern luxury in this architecturally stunning home located in the heart of Palo Alto. Designed with an emphasis on indoor-outdoor living, the residence features floor-to-ceiling glass walls that flood the interiors with natural light."}
            </p>
            <p>
              {dict?.property?.descP2 || "The open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private balcony."}
            </p>
          </>
        )}
      </div>
      <button className="mt-4 text-mosque font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
        {dict?.property?.readMore || "Read more"}
        <span className="material-icons text-sm">arrow_forward</span>
      </button>
    </div>
  );
}
