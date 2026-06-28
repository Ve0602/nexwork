/**
 * Lightweight skeleton placeholder for loading states.
 * Usage: <Skeleton width="60%" height={14} /> or <Skeleton.Card /> for a full card-shaped placeholder.
 */
export default function Skeleton({ width = '100%', height = 14, style = {} }) {
  return <div className="skeleton" style={{ width, height, ...style }} />;
}

Skeleton.Card = function SkeletonCard() {
  return (
    <div className="card" style={{ padding: '16px 18px' }}>
      <Skeleton width="40%" height={11} style={{ marginBottom: 10 }} />
      <Skeleton width="80%" height={15} style={{ marginBottom: 8 }} />
      <Skeleton width="60%" height={12} />
    </div>
  );
};

Skeleton.List = function SkeletonList({ count = 4 }) {
  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {Array.from({ length: count }).map((_, i) => <Skeleton.Card key={i} />)}
    </div>
  );
};
