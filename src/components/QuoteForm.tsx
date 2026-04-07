import { useState, useRef } from 'react';
import { Send, CheckCircle, Upload, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';

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

const QuoteForm = () => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    address: '',
    postalCode: '',
    city: '',
    services: {
      floor: false,
      stairs: false,
      repair: false,
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
    if (!formData.date) newErrors.date = t('form.required');
    if (!formData.area.trim()) newErrors.area = t('form.required');

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('Form submitted:', formData);
      setIsSubmitted(true);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
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
      services: { ...prev.services, [service]: checked }
    }));
    if (errors.services) {
      setErrors(prev => { const n = { ...prev }; delete n.services; return n; });
    }
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remainingSlots = 10 - formData.photos.length;
    const newPhotos = files.slice(0, remainingSlots);
    setFormData(prev => ({ ...prev, photos: [...prev.photos, ...newPhotos] }));
  };

  const removePhoto = (index: number) => {
    setFormData(prev => ({ ...prev, photos: prev.photos.filter((_, i) => i !== index) }));
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

  const stairFields = [
    { key: 'marches', label: t('form.stair.marches') },
    { key: 'barreaux', label: t('form.stair.barreaux') },
    { key: 'contremarches', label: t('form.stair.contremarches') },
    { key: 'poteaux', label: t('form.stair.poteaux') },
    { key: 'limon', label: t('form.stair.limon') },
    { key: 'fauxLimon', label: t('form.stair.fauxLimon') },
    { key: 'mainCourante', label: t('form.stair.mainCourante') },
  ];

  return (
    <section id="quote-form" className="section-padding bg-secondary">
      <div className="container-custom">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
              {t('form.title')}
            </h2>
            <p className="text-muted-foreground text-lg">{t('form.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="card-wood space-y-6">
            {/* Contact Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {(['firstName', 'lastName'] as const).map(field => (
                <div key={field} className="space-y-2">
                  <Label htmlFor={field}>{t(`form.${field}`)} *</Label>
                  <Input id={field} name={field} value={formData[field]} onChange={handleChange} className="bg-background" />
                  {errors[field] && <p className="text-destructive text-sm">{errors[field]}</p>}
                </div>
              ))}
              <div className="space-y-2">
                <Label htmlFor="phone">{t('form.phone')} *</Label>
                <Input id="phone" name="phone" type="tel" value={formData.phone} onChange={handleChange} placeholder="(514) 123-4567" className="bg-background" />
                {errors.phone && <p className="text-destructive text-sm">{errors.phone}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t('form.email')} *</Label>
                <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} className="bg-background" />
                {errors.email && <p className="text-destructive text-sm">{errors.email}</p>}
              </div>
            </div>

            {/* Address */}
            <div className="space-y-2">
              <Label htmlFor="address">{t('form.address')} *</Label>
              <Input id="address" name="address" value={formData.address} onChange={handleChange} className="bg-background" />
              {errors.address && <p className="text-destructive text-sm">{errors.address}</p>}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="postalCode">{t('form.postalCode')} *</Label>
                <Input id="postalCode" name="postalCode" value={formData.postalCode} onChange={handleChange} placeholder="H2X 1Y4" className="bg-background" />
                {errors.postalCode && <p className="text-destructive text-sm">{errors.postalCode}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">{t('form.city')} *</Label>
                <Input id="city" name="city" value={formData.city} onChange={handleChange} className="bg-background" />
                {errors.city && <p className="text-destructive text-sm">{errors.city}</p>}
              </div>
            </div>

            {/* Services */}
            <div className="space-y-3">
              <Label>{t('form.servicesTitle')} *</Label>
              <div className="space-y-3">
                {/* Floor Sanding */}
                <div className="flex items-center space-x-3">
                  <Checkbox id="service-floor" checked={formData.services.floor} onCheckedChange={(checked) => handleServiceChange('floor', checked as boolean)} />
                  <Label htmlFor="service-floor" className="font-normal cursor-pointer">{t('form.service.floor')}</Label>
                </div>
                {/* Floor Type Sub-choice */}
                {formData.services.floor && (
                  <div className="ml-7 space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <Label className="text-sm font-medium">{t('form.floorType.label')}</Label>
                    <RadioGroup value={formData.floorType} onValueChange={(value) => setFormData(prev => ({ ...prev, floorType: value }))} className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="prefinished" id="floor-prefinished" />
                        <Label htmlFor="floor-prefinished" className="font-normal cursor-pointer">{t('form.floorType.prefinished')}</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="regular" id="floor-regular" />
                        <Label htmlFor="floor-regular" className="font-normal cursor-pointer">{t('form.floorType.regular')}</Label>
                      </div>
                    </RadioGroup>
                    <p className="text-xs text-muted-foreground italic">{t('form.floorType.note')}</p>
                  </div>
                )}

                {/* Stair Sanding */}
                <div className="flex items-center space-x-3">
                  <Checkbox id="service-stairs" checked={formData.services.stairs} onCheckedChange={(checked) => handleServiceChange('stairs', checked as boolean)} />
                  <Label htmlFor="service-stairs" className="font-normal cursor-pointer">{t('form.service.stairs')}</Label>
                </div>
                {/* Stair Detail Fields */}
                {formData.services.stairs && (
                  <div className="ml-7 space-y-3 p-4 bg-muted/50 rounded-lg border border-border">
                    <Label className="text-sm font-medium">{t('form.stair.detailsLabel')}</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {stairFields.map(({ key, label }) => (
                        <div key={key} className="space-y-1">
                          <Label htmlFor={`stair-${key}`} className="text-sm font-normal">{label}</Label>
                          <Input
                            id={`stair-${key}`}
                            type="number"
                            min="0"
                            value={formData.stairDetails[key as keyof typeof formData.stairDetails]}
                            onChange={(e) => handleStairDetailChange(key, e.target.value)}
                            className="bg-background"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Floor Repair */}
                <div className="flex items-center space-x-3">
                  <Checkbox id="service-repair" checked={formData.services.repair} onCheckedChange={(checked) => handleServiceChange('repair', checked as boolean)} />
                  <Label htmlFor="service-repair" className="font-normal cursor-pointer">{t('form.service.repair')}</Label>
                </div>
              </div>
              {errors.services && <p className="text-destructive text-sm">{errors.services}</p>}
            </div>

            {/* Date */}
            <div className="space-y-2">
              <Label htmlFor="date">{t('form.date')} *</Label>
              <Input id="date" name="date" type="date" value={formData.date} onChange={handleChange} className="bg-background" />
              {errors.date && <p className="text-destructive text-sm">{errors.date}</p>}
            </div>

            {/* Details */}
            <div className="space-y-2">
              <Label htmlFor="details">{t('form.details')}</Label>
              <Textarea id="details" name="details" value={formData.details} onChange={handleChange} rows={4} className="bg-background resize-none" />
            </div>

            {/* Area */}
            <div className="space-y-2">
              <Label htmlFor="area">{t('form.area')} *</Label>
              <Input id="area" name="area" value={formData.area} onChange={handleChange} placeholder="Ex: 500" className="bg-background" />
              <p className="text-sm text-muted-foreground">{t('form.areaHelper')}</p>
              <p className="text-sm text-muted-foreground">{t('form.areaExample')}</p>
              {errors.area && <p className="text-destructive text-sm">{errors.area}</p>}
            </div>

            {/* Want Color */}
            <div className="space-y-3">
              <Label>{t('form.wantColor')}</Label>
              <RadioGroup value={formData.wantColor} onValueChange={(value) => setFormData(prev => ({ ...prev, wantColor: value }))} className="flex gap-6">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="yes" id="color-yes" />
                  <Label htmlFor="color-yes" className="font-normal cursor-pointer">{t('form.colorYes')}</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="no" id="color-no" />
                  <Label htmlFor="color-no" className="font-normal cursor-pointer">{t('form.colorNo')}</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Photo Upload */}
            <div className="space-y-3">
              <Label>{t('form.photos')}</Label>
              <p className="text-sm text-muted-foreground">{t('form.photosMax')}</p>
              <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:border-primary transition-colors" onClick={() => fileInputRef.current?.click()}>
                <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">{formData.photos.length}/10</p>
                <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handlePhotoUpload} className="hidden" disabled={formData.photos.length >= 10} />
              </div>
              {formData.photos.length > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mt-4">
                  {formData.photos.map((photo, index) => (
                    <div key={index} className="relative aspect-square bg-muted rounded-lg overflow-hidden">
                      <img src={URL.createObjectURL(photo)} alt={`Photo ${index + 1}`} className="w-full h-full object-cover" />
                      <button type="button" onClick={() => removePhoto(index)} className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
              <p className="text-xs text-muted-foreground">{t('form.uploadNote')}</p>
            </div>

            {/* Special Needs */}
            <div className="space-y-2">
              <Label htmlFor="specialNeeds">{t('form.specialNeeds')}</Label>
              <Textarea id="specialNeeds" name="specialNeeds" value={formData.specialNeeds} onChange={handleChange} rows={3} className="bg-background resize-none" />
            </div>

            {/* Submit */}
            <Button type="submit" size="lg" className="w-full">
              <Send className="w-5 h-5" />
              {t('form.submit')}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default QuoteForm;
