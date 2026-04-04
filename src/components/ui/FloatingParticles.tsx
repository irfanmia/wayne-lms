'use client';

export default function FloatingParticles() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <div
          key={i}
          className="floating-particle"
          style={{
            left: `${8 + (i * 7.5) % 85}%`,
            top: `${10 + (i * 13) % 70}%`,
            width: `${4 + (i % 4) * 3}px`,
            height: `${4 + (i % 4) * 3}px`,
            animationDelay: `${i * 0.7}s`,
            animationDuration: `${6 + (i % 3) * 2}s`,
            opacity: 0.15 + (i % 3) * 0.1,
          }}
        />
      ))}
      {/* Gradient mesh blobs */}
      <div className="absolute -top-20 -right-20 w-72 h-72 bg-orange-300/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-orange-200/15 rounded-full blur-3xl" />
    </div>
  );
}
