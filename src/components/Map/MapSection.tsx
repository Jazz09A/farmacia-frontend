import React from 'react';

type MapSectionProps = {
  title?: string;
  subtitle?: string;
  embedSrc?: string;
  height?: number;
};

export const MapSection: React.FC<MapSectionProps> = ({
  title = 'Nuestra ubicación',
  subtitle = 'Visítanos o coordina envíos a tu farmacia',
  embedSrc = 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d62837.56333086802!2d-66.975!3d10.491!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8c2a58eaa3b4a5e7%3A0x5c0f9b7c1f1e3b5!2sCaracas%2C%20Venezuela!5e0!3m2!1ses-419!2sve!4v1712080000000!5m2!1ses-419!2sve',
  height = 420,
}) => {
  return (
    <section className="py-16 bg-white">
      <div className="medical-container">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900">{title}</h2>
          {subtitle && (
            <p className="text-gray-600 mt-2">{subtitle}</p>
          )}
        </div>
        <div className="w-full rounded-2xl overflow-hidden shadow-md border border-gray-200">
          <iframe
            title="Empresa - Mapa"
            src={embedSrc}
            width="100%"
            height={height}
            style={{ border: 0 }}
            loading="lazy"
            allowFullScreen
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </div>
    </section>
  );
};

export default MapSection;


