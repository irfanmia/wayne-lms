'use client';
import { useState, useEffect } from 'react';
import api from '@/lib/api';

interface FormField {
  id: number;
  field_name: string;
  field_label: string;
  field_type: string;
  placeholder: string;
  required: boolean;
  order: number;
  options: string[];
}

interface LMSForm {
  id: number;
  name: string;
  form_type: string;
  is_active: boolean;
  fields: FormField[];
}

export default function FormsPage() {
  const [forms, setForms] = useState<LMSForm[]>([]);
  const [selected, setSelected] = useState<LMSForm | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getForms().then(data => { setForms(data); if (data.length) setSelected(data[0]); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-heading font-bold mb-8">Form Editor</h1>

      <div className="flex gap-6">
        {/* Form list */}
        <div className="w-64 shrink-0">
          <h2 className="font-medium text-sm text-gray-500 mb-3">Forms</h2>
          <div className="space-y-2">
            {forms.map(f => (
              <button key={f.id} onClick={() => setSelected(f)}
                className={`w-full text-left px-4 py-3 rounded-lg text-sm transition ${selected?.id === f.id ? 'bg-orange-50 border border-orange-200' : 'border hover:bg-gray-50'}`}>
                <div className="font-medium">{f.name}</div>
                <div className="text-xs text-gray-400 capitalize">{f.form_type}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Form preview */}
        <div className="flex-1">
          {selected ? (
            <div className="border rounded-xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-heading font-bold">{selected.name}</h2>
                <span className={`text-xs px-2 py-1 rounded-full ${selected.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                  {selected.is_active ? 'Active' : 'Inactive'}
                </span>
              </div>
              <div className="space-y-4">
                {selected.fields.map(field => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.field_label} {field.required && <span className="text-red-500">*</span>}
                    </label>
                    {field.field_type === 'textarea' ? (
                      <textarea placeholder={field.placeholder} className="w-full px-3 py-2 border rounded-lg text-sm" rows={3} disabled />
                    ) : field.field_type === 'select' ? (
                      <select className="w-full px-3 py-2 border rounded-lg text-sm" disabled>
                        <option>{field.placeholder || 'Select...'}</option>
                        {field.options.map((o, i) => <option key={i}>{o}</option>)}
                      </select>
                    ) : field.field_type === 'checkbox' ? (
                      <div className="flex flex-wrap gap-3">
                        {field.options.map((o, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm"><input type="checkbox" disabled />{o}</label>
                        ))}
                      </div>
                    ) : field.field_type === 'radio' ? (
                      <div className="flex flex-wrap gap-3">
                        {field.options.map((o, i) => (
                          <label key={i} className="flex items-center gap-2 text-sm"><input type="radio" name={field.field_name} disabled />{o}</label>
                        ))}
                      </div>
                    ) : (
                      <input type={field.field_type} placeholder={field.placeholder} className="w-full px-3 py-2 border rounded-lg text-sm" disabled />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-center py-16">Select a form to preview</p>
          )}
        </div>
      </div>
    </div>
  );
}
