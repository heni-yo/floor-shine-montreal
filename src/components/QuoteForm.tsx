import { useState } from 'react';
import { Send, CheckCircle } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  city: string;
  serviceType: string;
  woodType: string;
  area: string;
  date: string;
  message: string;
  consent: boolean;
}

interface FormErrors {
  [key: string]: string;
}

const QuoteForm = () => {
  const { t } = useLanguage();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    city: '',
    serviceType: '',
    woodType: '',
    area: '',
    date: '',
    message: '',
    consent: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = t('form.required');
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = t('form.required');
    }
    if (!formData.phone.trim()) {
      newErrors.phone = t('form.required');
    } else if (!/^[\d\s\-()+ ]{10,}$/.test(formData.phone)) {
      newErrors.phone = t('form.invalidPhone');
    }
    if (!formData.email.trim()) {
      newErrors.email = t('form.required');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('form.invalidEmail');
    }
    if (!formData.city.trim()) {
      newErrors.city = t('form.required');
    }
    if (!formData.serviceType) {
      newErrors.serviceType = t('form.required');
    }
    if (!formData.consent) {
      newErrors.consent = t('form.required');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // Here you would normally send the data to your backend
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  if (isSubmitted) {
    return (
      <section id="quote-form" className="section-padding bg-secondary">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <div className="card-wood p-12">
              <CheckCircle className="w-16 h-16 text-primary mx-auto mb-6" />
              <h3 className="font-serif text-2xl md:text-3xl font-bold text-foreground mb-4">
                {t('form.success')}
              </h3>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="quote-form" className="section-padding bg-secondary">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('form.title')}
            </h2>
            <p className="text-muted-foreground text-lg">
              {t('form.subtitle')}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="card-wood">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* First Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.firstName')} *
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  className="input-wood"
                />
                {errors.firstName && (
                  <p className="text-destructive text-sm mt-1">{errors.firstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.lastName')} *
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  className="input-wood"
                />
                {errors.lastName && (
                  <p className="text-destructive text-sm mt-1">{errors.lastName}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.phone')} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(514) 123-4567"
                  className="input-wood"
                />
                {errors.phone && (
                  <p className="text-destructive text-sm mt-1">{errors.phone}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="input-wood"
                />
                {errors.email && (
                  <p className="text-destructive text-sm mt-1">{errors.email}</p>
                )}
              </div>

              {/* City */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.city')} *
                </label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  className="input-wood"
                />
                {errors.city && (
                  <p className="text-destructive text-sm mt-1">{errors.city}</p>
                )}
              </div>

              {/* Service Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.serviceType')} *
                </label>
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleChange}
                  className="input-wood"
                >
                  <option value="">--</option>
                  <option value="floor">{t('form.serviceType.floor')}</option>
                  <option value="stairs">{t('form.serviceType.stairs')}</option>
                  <option value="repair">{t('form.serviceType.repair')}</option>
                </select>
                {errors.serviceType && (
                  <p className="text-destructive text-sm mt-1">{errors.serviceType}</p>
                )}
              </div>

              {/* Wood Type */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.woodType')}
                </label>
                <input
                  type="text"
                  name="woodType"
                  value={formData.woodType}
                  onChange={handleChange}
                  placeholder="Ex: Érable, Chêne..."
                  className="input-wood"
                />
              </div>

              {/* Area */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.area')}
                </label>
                <input
                  type="text"
                  name="area"
                  value={formData.area}
                  onChange={handleChange}
                  placeholder="Ex: 500"
                  className="input-wood"
                />
              </div>

              {/* Date */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.date')}
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleChange}
                  className="input-wood"
                />
              </div>

              {/* Message */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-foreground mb-2">
                  {t('form.message')}
                </label>
                <textarea
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  rows={4}
                  className="input-wood resize-none"
                />
              </div>

              {/* Consent */}
              <div className="md:col-span-2">
                <label className="flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="consent"
                    checked={formData.consent}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-sm text-muted-foreground">
                    {t('form.consent')} *
                  </span>
                </label>
                {errors.consent && (
                  <p className="text-destructive text-sm mt-1">{errors.consent}</p>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <div className="mt-8">
              <button type="submit" className="btn-primary w-full py-4 text-lg">
                <Send className="w-5 h-5" />
                {t('form.submit')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
