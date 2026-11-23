const PHOTOS = [
  {
    url: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
    alt: 'Avion en vol au coucher du soleil',
  },
  {
    url: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80',
    alt: "Cockpit d'avion moderne",
  },
  {
    url: 'https://images.unsplash.com/photo-1578575437130-527eed3abbec?w=600&q=80',
    alt: 'Aéroport international',
  },
  {
    url: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80',
    alt: "Piste d'atterrissage de nuit",
  },
];

export default function GallerySection() {
  return (
    <section className="py-24 bg-white dark:bg-[#0a1428]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <span className="inline-block px-4 py-1.5 bg-[#059669]/10 text-[#059669] text-sm font-semibold rounded-full mb-4 border border-[#059669]/20">
            Galerie
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#0f172a] dark:text-white mb-4">
            L'aviation en images
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {PHOTOS.map((photo, i) => (
            <div
              key={i}
              className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 ${
                i === 0 ? 'sm:col-span-2 sm:row-span-2' : ''
              }`}
            >
              <img
                src={photo.url}
                alt={photo.alt}
                className="w-full h-56 sm:h-full object-cover group-hover:scale-105 transition-transform duration-500"
                style={i === 0 ? { minHeight: '300px' } : {}}
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#070f1f]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="absolute bottom-4 left-4 text-white text-sm font-semibold opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                {photo.alt}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
