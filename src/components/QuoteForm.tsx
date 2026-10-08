'use client';

import { useState, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { Send, CheckCircle, Upload, X, Loader2, Check, Phone } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PHONE_DISPLAY, PHONE_HREF, type ServiceKey } from '@/lib/site';

/** Mêmes limites que le serveur (server/app.ts : multer). */
const MAX_PHOTOS = 10;
const MAX_PHOTO_BYTES = 8 * 1024 * 1024;
const SERVICE_KEYS: ServiceKey[] = ['floor', 'stairs', 'repair'];

interface FormData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  address: string;
  postalCode: string;
  city: string;
  services: {
    floor: boolean;
    stairs: boolean;
    repair: boolean;
  };
  floorType: string;
  stairDetails: {
    marches: string;
    barreaux: string;
    contremarches: string;
    poteaux: string;
    limon: string;
    fauxLimon: string;
    mainCourante: string;
  };
  date: string;
  details: string;
  area: string;
  wantColor: string;
  specialNeeds: string;
  photos: File[];
}

interface FormErrors {
  [key: string]: string;
}

const QuoteForm = ({ defaultService }: { defaultService?: ServiceKey } = {}) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  /** Champ piège : invisible pour les humains, rempli par les robots. */
  const honeypotRef = useRef<HTMLInputElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    services: {
      floor: defaultService === 'floor',
      stairs: defaultService === 'stairs',
      repair: defaultService === 'repair',
    },
    floorType: '',
    stairDetails: {
      marches: '',
      barreaux: '',
      contremarches: '',
      poteaux: '',
      limon: '',
      fauxLimon: '',
      mainCourante: '',
    },
    date: '',
    details: '',
    area: '',
    wantColor: '',
    specialNeeds: '',
    photos: [],
  });
  const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (!isSubmitted) return;
    document.getElementById('quote-form')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [isSubmitted]);

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.firstName.trim()) newErrors.firstName = t('form.required');
    if (!formData.lastName.trim()) newErrors.lastName = t('form.required');
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
    if (!formData.address.trim()) newErrors.address = t('form.required');
    if (!formData.postalCode.trim()) {
      newErrors.postalCode = t('form.required');
    } else if (!/^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/.test(formData.postalCode)) {
      newErrors.postalCode = t('form.invalidPostalCode');
    }
    if (!formData.city.trim()) newErrors.city = t('form.required');
    if (!formData.services.floor && !formData.services.stairs && !formData.services.repair) {
      newErrors.services = t('form.selectService');
    }
    if (formData.services.floor && !formData.floorType) {
      newErrors.floorType = t('form.required');
    }
    if (!formData.date) newErrors.date = t('form.required');
    if (formData.services.floor && !formData.area.trim()) newErrors.area = t('form.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const buildPayload = () => ({
    firstName: formData.firstName.trim(),
    lastName: formData.lastName.trim(),
    phone: formData.phone.trim(),
    email: formData.email.trim(),
    address: formData.address.trim(),
    postalCode: formData.postalCode.trim(),
    city: formData.city.trim(),
    services: {
      floor: formData.services.floor,
      stairs: formData.services.stairs,
      repair: formData.services.repair,
    },
    floorType: formData.floorType,
    stairDetails: { ...formData.stairDetails },
    date: formData.date,
    details: formData.details,
    area: formData.area.trim(),
    wantColor: formData.wantColor,
    specialNeeds: formData.specialNeeds,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || isSubmitting) return;

    setIsSubmitting(true);
    const apiBase = process.env.NEXT_PUBLIC_API_URL ?? '';
    const fd = new FormData();
    fd.append('data', JSON.stringify(buildPayload()));
    fd.append('website', honeypotRef.current?.value ?? '');
    formData.photos.forEach((file) => fd.append('photos', file));

    try {
      const res = await fetch(`${apiBase}/api/quote`, {
        method: 'POST',
        body: fd,
      });
      const json = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          typeof json?.error?.message === 'string' ? json.error.message : t('form.errorServer');
        toast.error(msg);
        return;
      }
      setIsSubmitted(true);
    } catch {
      toast.error(t('form.errorNetwork'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Superficie: n'accepter que des chiffres (ex: 500)
    if (name === 'area') {
      const digitsOnly = value.replace(/[^\d]/g, '');
      setFormData((prev) => ({ ...prev, area: digitsOnly }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
    if (errors[name]) {
      setErrors(prev => { const n = { ...prev }; delete n[name]; return n; });
    }
  };

  const handleStairDetailChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      stairDetails: { ...prev.stairDetails, [field]: value }
    }));
  };

  const handleServiceChange = (service: 'floor' | 'stairs' | 'repair', checked: boolean) => {
    setFormData(prev => ({
      ...prev,
      services: { ...prev.services, [service]: checked },
      ...(service === 'floor' && !checked ? { floorType: '' } : {}),
    }));
    if (errors.services) {
      setErrors(prev => { const n = { ...prev }; delete n.services; return n; });
    }
    if (service === 'floor' && !checked && errors.floorType) {
      setErrors(prev => { const n = { ...prev }; delete n.floorType; return n; });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    // Mêmes limites que le serveur (8 Mo, images) : on refuse avant l'envoi
    // plutôt que de faire attendre le client pour une erreur 413.
    const accepted = files.filter((f) => f.type.startsWith('image/') && f.size <= MAX_PHOTO_BYTES);
    if (accepted.length < files.length) toast.error(t('form.photos.hint'));
    const remainingSlots = MAX_PHOTOS - formData.photos.length;
    setFormData((prev) => ({ ...prev, photos: [...prev.photos, ...accepted.slice(0, remainingSlots)] }));
    // Permet de re-sélectionner le même fichier après l'avoir retiré.
    e.target.value = '';
  };

  const removePhoto = (index: number) => {
    setFormData((prev) => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
  };

  if (isSubmitted) {
    return (
      <section id="quote-form" className="section bg-surface">
        <div className="container-custom">
          <div className="mx-auto max-w-2xl rounded-xl border border-border bg-background p-10 text-center shadow-sm md:p-14">
            <span className="mx-auto mb-6 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary-soft">
              <CheckCircle className="h-8 w-8 text-primary" aria-hidden />
            </span>
            <p className="font-serif text-2xl font-bold leading-snug text-foreground md:text-3xl">
              {t('form.success')}
            </p>
            <a
              href={PHONE_HREF}
              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
            >
              <Phone className="h-4 w-4" aria-hidden />
              {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    );
  }

  const stairFields = [
    { key: 'marches', label: t('form.stair.marches') },
    { key: 'contremarches', label: t('form.stair.contremarches') },
    { key: 'barreaux', label: t('form.stair.barreaux') },
    { key: 'poteaux', label: t('form.stair.poteaux') },
    { key: 'limon', label: t('form.stair.limon') },
    { key: 'fauxLimon', label: t('form.stair.fauxLimon') },
    { key: 'mainCourante', label: t('form.stair.mainCourante') },
  ];

  const fieldError = (name: string) =>
    errors[name] ? (
      <p role="alert" className="mt-1.5 text-sm text-destructive">
        {errors[name]}
      </p>
    ) : null;

  const inputClass = 'mt-1.5 h-11 bg-background';
  const groupTitle =
    'mb-5 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground';

  return (
    <section id="quote-form" className="section bg-surface">
      <div className="container-custom grid gap-10 lg:grid-cols-[minmax(0,4fr)_minmax(0,7fr)] lg:gap-14">
        {/* ---------- Colonne d'accompagnement ---------- */}
        <aside className="lg:sticky lg:top-28 lg:self-start">
          <p className="eyebrow">{t('form.eyebrow')}</p>
          <h2 className="h-section mt-3 text-foreground">{t('form.title')}</h2>
          <p className="lead mt-4">{t('form.subtitle')}</p>

          <ul className="mt-8 space-y-3.5">
            {['form.aside.point1', 'form.aside.point2', 'form.aside.point3'].map((key) => (
              <li key={key} className="flex items-start gap-3 text-foreground">
                <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                  <Check className="h-3 w-3 text-primary" aria-hidden />
                </span>
                {t(key)}
              </li>
            ))}
          </ul>

          <div className="mt-8 border-t border-border pt-6">
            <p className="text-sm text-muted-foreground">{t('form.aside.call')}</p>
            <a
              href={PHONE_HREF}
              className="mt-1.5 inline-flex items-center gap-2 text-xl font-semibold text-foreground transition-colors hover:text-primary"
            >
              <Phone className="h-5 w-5 text-primary" aria-hidden />
              {PHONE_DISPLAY}
            </a>
          </div>
        </aside>

        {/* ---------- Formulaire ---------- */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="rounded-xl border border-border bg-background shadow-md"
        >
          {/* Champ piège anti-robots : hors écran, ignoré par les lecteurs d’écran et l’autocomplétion. */}
          <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
            <label htmlFor="website">Site web</label>
            <input ref={honeypotRef} id="website" name="website" type="text" tabIndex={-1} autoComplete="off" defaultValue="" />
          </div>

          <fieldset className="border-b border-border p-6 md:p-8">
            <legend className="sr-only">{t('form.group.contact')}</legend>
            <p aria-hidden="true" className={groupTitle}>
              {t('form.group.contact')}
            </p>

            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2">
              {(['firstName', 'lastName'] as const).map((field) => (
                <div key={field}>
                  <Label htmlFor={field}>{t(`form.${field}`)} *</Label>
                  <Input
                    id={field}
                    name={field}
                    autoComplete={field === 'firstName' ? 'given-name' : 'family-name'}
                    value={formData[field]}
                    onChange={handleChange}
                    className={inputClass}
                    aria-invalid={!!errors[field]}
                  />
                  {fieldError(field)}
                </div>
              ))}

              <div>
                <Label htmlFor="phone">{t('form.phone')} *</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="(450) 123-4567"
                  className={inputClass}
                  aria-invalid={!!errors.phone}
                />
                {fieldError('phone')}
              </div>

              <div>
                <Label htmlFor="email">{t('form.email')} *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={formData.email}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.email}
                />
                {fieldError('email')}
              </div>

              <div className="sm:col-span-2">
                <Label htmlFor="address">{t('form.address')} *</Label>
                <Input
                  id="address"
                  name="address"
                  autoComplete="street-address"
                  value={formData.address}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.address}
                />
                {fieldError('address')}
              </div>

              <div>
                <Label htmlFor="city">{t('form.city')} *</Label>
                <Input
                  id="city"
                  name="city"
                  autoComplete="address-level2"
                  value={formData.city}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.city}
                />
                {fieldError('city')}
              </div>

              <div>
                <Label htmlFor="postalCode">{t('form.postalCode')} *</Label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  autoComplete="postal-code"
                  value={formData.postalCode}
                  onChange={handleChange}
                  placeholder="H2X 1Y4"
                  className={`${inputClass} uppercase placeholder:normal-case`}
                  aria-invalid={!!errors.postalCode}
                />
                {fieldError('postalCode')}
              </div>
            </div>
          </fieldset>

          <fieldset className="border-b border-border p-6 md:p-8">
            <legend className="sr-only">{t('form.group.project')}</legend>
            <p aria-hidden="true" className={groupTitle}>
              {t('form.group.project')}
            </p>

            <p id="services-label" className="mb-3 text-sm font-medium text-foreground">
              {t('form.servicesTitle')} *
            </p>

            {/* Choix du service en cartes : cible tactile plus grande, état coché visible */}
            <div role="group" aria-labelledby="services-label" className="grid gap-3 sm:grid-cols-3">
              {SERVICE_KEYS.map((key) => {
                const checked = formData.services[key];
                return (
                  <label
                    key={key}
                    htmlFor={`service-${key}`}
                    className={`flex min-h-[3.5rem] cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      checked
                        ? 'border-primary bg-primary-soft'
                        : 'border-border hover:border-border-strong hover:bg-surface'
                    }`}
                  >
                    <Checkbox
                      id={`service-${key}`}
                      checked={checked}
                      onCheckedChange={(value) => handleServiceChange(key, value === true)}
                    />
                    <span className="text-sm font-medium text-foreground">{t(`form.service.${key}`)}</span>
                  </label>
                );
              })}
            </div>
            {fieldError('services')}

            {formData.services.floor && (
              <div className="animate-fade-in mt-5 space-y-5 rounded-lg border border-border bg-surface p-5">
                <p className="text-sm font-semibold text-foreground">{t('form.service.floor')}</p>
                <div>
                  <Label className="text-sm">{t('form.floorType.label')} *</Label>
                  <RadioGroup
                    value={formData.floorType}
                    onValueChange={(value) => {
                      setFormData((prev) => ({ ...prev, floorType: value }));
                      setErrors((prev) => {
                        if (!prev.floorType) return prev;
                        const next = { ...prev };
                        delete next.floorType;
                        return next;
                      });
                    }}
                    className="mt-2.5 space-y-2.5"
                  >
                    <div className="flex items-start gap-2.5">
                      <RadioGroupItem value="regular" id="floor-regular" className="mt-0.5" />
                      <Label htmlFor="floor-regular" className="cursor-pointer font-normal leading-snug">
                        {t('form.floorType.regular')}
                      </Label>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <RadioGroupItem value="prefinished" id="floor-prefinished" className="mt-0.5" />
                      <Label htmlFor="floor-prefinished" className="cursor-pointer font-normal leading-snug">
                        {t('form.floorType.prefinished')}
                      </Label>
                    </div>
                  </RadioGroup>
                  {fieldError('floorType')}
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="area">{t('form.area')} *</Label>
                    <Input
                      id="area"
                      name="area"
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={formData.area}
                      onChange={handleChange}
                      placeholder="500"
                      className={inputClass}
                      aria-invalid={!!errors.area}
                      aria-describedby="area-help"
                    />
                    <p id="area-help" className="mt-1.5 text-xs text-muted-foreground">
                      {t('form.areaHelper')}
                    </p>
                    {fieldError('area')}
                  </div>

                  <div>
                    <Label>{t('form.wantColor')}</Label>
                    <RadioGroup
                      value={formData.wantColor}
                      onValueChange={(value) => setFormData((prev) => ({ ...prev, wantColor: value }))}
                      className="mt-3 flex gap-6"
                    >
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="yes" id="color-yes" />
                        <Label htmlFor="color-yes" className="cursor-pointer font-normal">
                          {t('form.colorYes')}
                        </Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <RadioGroupItem value="no" id="color-no" />
                        <Label htmlFor="color-no" className="cursor-pointer font-normal">
                          {t('form.colorNo')}
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>
                </div>
              </div>
            )}

            {formData.services.stairs && (
              <div className="animate-fade-in mt-5 rounded-lg border border-border bg-surface p-5">
                <p className="text-sm font-semibold text-foreground">{t('form.stair.detailsLabel')}</p>
                <div className="mt-4 grid gap-x-4 gap-y-4 sm:grid-cols-2">
                  {stairFields.map(({ key, label }) => (
                    <div key={key}>
                      <Label htmlFor={`stair-${key}`} className="text-sm font-normal">
                        {label}
                      </Label>
                      <Input
                        id={`stair-${key}`}
                        type="number"
                        inputMode="numeric"
                        min="0"
                        value={formData.stairDetails[key as keyof typeof formData.stairDetails]}
                        onChange={(e) => handleStairDetailChange(key, e.target.value)}
                        className={inputClass}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 grid gap-5">
              <div className="sm:max-w-[50%] sm:pr-2">
                <Label htmlFor="date">{t('form.date')} *</Label>
                <Input
                  id="date"
                  name="date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  className={inputClass}
                  aria-invalid={!!errors.date}
                />
                {fieldError('date')}
              </div>

              <div>
                <Label htmlFor="details">{t('form.details')}</Label>
                <Textarea
                  id="details"
                  name="details"
                  value={formData.details}
                  onChange={handleChange}
                  placeholder={t('form.detailsPlaceholder')}
                  rows={4}
                  className="mt-1.5 resize-y bg-background"
                />
              </div>

              <div>
                <Label htmlFor="specialNeeds">{t('form.specialNeeds')}</Label>
                <Textarea
                  id="specialNeeds"
                  name="specialNeeds"
                  value={formData.specialNeeds}
                  onChange={handleChange}
                  rows={2}
                  className="mt-1.5 resize-y bg-background"
                />
              </div>
            </div>
          </fieldset>

          {/* Au niveau supérieur : les photos sont utiles pour les trois services. */}
          <fieldset className="p-6 md:p-8">
            <legend className="sr-only">{t('form.group.photos')}</legend>
            <p aria-hidden="true" className="mb-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {t('form.group.photos')}
            </p>
            <p className="mb-4 text-sm text-muted-foreground">{t('form.photos')}</p>

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={formData.photos.length >= MAX_PHOTOS}
              className="flex w-full items-center gap-4 rounded-lg border-2 border-dashed border-border p-5 text-left transition-colors hover:border-primary hover:bg-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-primary-soft">
                <Upload className="h-5 w-5 text-primary" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-semibold text-foreground">{t('form.photos.cta')}</span>
                <span className="block text-xs text-muted-foreground">{t('form.photos.hint')}</span>
              </span>
              {formData.photos.length > 0 && (
                <span className="text-sm font-medium tabular-nums text-muted-foreground">
                  {formData.photos.length}/{MAX_PHOTOS}
                </span>
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              disabled={formData.photos.length >= MAX_PHOTOS}
            />

            {formData.photos.length > 0 && (
              <>
                <ul className="mt-4 grid grid-cols-4 gap-3 sm:grid-cols-5">
                  {formData.photos.map((photo, index) => (
                    <li
                      key={`${photo.name}-${photo.lastModified}-${index}`}
                      className="relative aspect-square overflow-hidden rounded-lg bg-muted"
                    >
                      <PhotoThumb file={photo} />
                      <button
                        type="button"
                        onClick={() => removePhoto(index)}
                        className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white transition-colors hover:bg-destructive"
                        aria-label={`${t('form.photos.remove')} ${index + 1}`}
                      >
                        <X className="h-3.5 w-3.5" aria-hidden />
                      </button>
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">{t('form.uploadNote')}</p>
              </>
            )}

            <Button type="submit" size="lg" className="mt-7 h-12 w-full text-base" disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
              ) : (
                <Send className="h-5 w-5" aria-hidden />
              )}
              {isSubmitting ? t('form.submitting') : t('form.submit')}
            </Button>
          </fieldset>
        </form>
      </div>
    </section>
  );
};

/**
 * Aperçu d'une photo choisie. L'URL temporaire est créée une seule fois et
 * libérée au démontage — l'ancien code en recréait une à chaque rendu.
 */
const PhotoThumb = ({ file }: { file: File }) => {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const objectUrl = URL.createObjectURL(file);
    setUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return url ? <img src={url} alt="" className="h-full w-full object-cover" /> : null;
};

export default QuoteForm;
