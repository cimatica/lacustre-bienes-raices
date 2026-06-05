type Props = {
  description?: string;
};

export default function PropertyDescription({ description }: Props) {
  return (
    <div className="bg-white p-8 rounded-xl shadow-sm border border-mosque/5">
      <h2 className="text-lg font-semibold mb-4 text-nordic">About this home</h2>
      <div className="prose prose-slate max-w-none text-nordic/70 leading-relaxed">
        {description ? (
          <p>{description}</p>
        ) : (
          <>
            <p className="mb-4">
              Experience modern luxury in this architecturally stunning home located in the heart of Palo Alto. Designed with an emphasis on indoor-outdoor living, the residence features floor-to-ceiling glass walls that flood the interiors with natural light.
            </p>
            <p>
              The open-concept kitchen is equipped with top-of-the-line appliances and custom cabinetry, perfect for culinary enthusiasts. Retreat to the primary suite, a sanctuary of relaxation with a spa-inspired bath and private balcony.
            </p>
          </>
        )}
      </div>
      <button className="mt-4 text-mosque font-semibold text-sm flex items-center gap-1 hover:gap-2 transition-all">
        Read more
        <span className="material-icons text-sm">arrow_forward</span>
      </button>
    </div>
  );
}
