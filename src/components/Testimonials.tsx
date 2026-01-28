import { Star, Quote } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

const Testimonials = () => {
  const { t, language } = useLanguage();

  const testimonials = language === 'fr' ? [
    {
      name: 'Marie-Claire Tremblay',
      location: 'Montréal (Plateau)',
      text: 'Un travail exceptionnel! Mon plancher de 30 ans a retrouvé tout son éclat. L\'équipe était professionnelle, ponctuelle et très respectueuse de notre maison.',
      rating: 5,
    },
    {
      name: 'Jean-Pierre Gagnon',
      location: 'Laval',
      text: 'Excellent service du début à la fin. La soumission était claire et le prix final correspondait exactement à ce qui avait été convenu. Je recommande sans hésitation!',
      rating: 5,
    },
    {
      name: 'Sophie Bergeron',
      location: 'Longueuil',
      text: 'Ils ont sablé nos escaliers et le plancher du salon. Le résultat est magnifique! On se croirait dans une maison neuve. Merci pour votre travail impeccable.',
      rating: 5,
    },
    {
      name: 'Martin Dubois',
      location: 'Brossard',
      text: 'Très satisfait du résultat. L\'équipe a pris le temps de bien nous expliquer le processus et de répondre à toutes nos questions. Travail soigné et professionnel.',
      rating: 5,
    },
    {
      name: 'Isabelle Roy',
      location: 'Montréal (Rosemont)',
      text: 'Service rapide et efficace. Le plancher est superbe! Je n\'aurais jamais cru qu\'il pouvait redevenir aussi beau. Merci encore!',
      rating: 5,
    },
    {
      name: 'François Lavoie',
      location: 'Terrebonne',
      text: 'Nous avons fait appel à eux pour la réparation et le sablage de notre plancher endommagé par l\'eau. Le résultat est spectaculaire, on ne voit plus aucune trace!',
      rating: 5,
    },
  ] : [
    {
      name: 'Marie-Claire Tremblay',
      location: 'Montreal (Plateau)',
      text: 'Exceptional work! My 30-year-old floor has regained all its shine. The team was professional, punctual and very respectful of our home.',
      rating: 5,
    },
    {
      name: 'Jean-Pierre Gagnon',
      location: 'Laval',
      text: 'Excellent service from start to finish. The quote was clear and the final price matched exactly what had been agreed. I recommend without hesitation!',
      rating: 5,
    },
    {
      name: 'Sophie Bergeron',
      location: 'Longueuil',
      text: 'They sanded our stairs and living room floor. The result is beautiful! It feels like a brand new house. Thank you for your impeccable work.',
      rating: 5,
    },
    {
      name: 'Martin Dubois',
      location: 'Brossard',
      text: 'Very satisfied with the result. The team took the time to explain the process and answer all our questions. Careful and professional work.',
      rating: 5,
    },
    {
      name: 'Isabelle Roy',
      location: 'Montreal (Rosemont)',
      text: 'Fast and efficient service. The floor is superb! I never thought it could look this beautiful again. Thanks again!',
      rating: 5,
    },
    {
      name: 'François Lavoie',
      location: 'Terrebonne',
      text: 'We called them for the repair and sanding of our water-damaged floor. The result is spectacular, no traces visible anymore!',
      rating: 5,
    },
  ];

  return (
    <section id="testimonials" className="section-padding bg-background">
      <div className="container-custom">
        {/* Header */}
        <div className="text-center mb-12 md:mb-16">
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-4">
            {t('testimonials.title')}
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            {t('testimonials.subtitle')}
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card-wood relative">
              {/* Quote Icon */}
              <Quote className="absolute top-6 right-6 w-8 h-8 text-primary/20" />

              {/* Stars */}
              <div className="flex gap-1 mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-current" />
                ))}
              </div>

              {/* Text */}
              <p className="text-foreground mb-6 leading-relaxed">
                "{testimonial.text}"
              </p>

              {/* Author */}
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-sm text-muted-foreground">{testimonial.location}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
