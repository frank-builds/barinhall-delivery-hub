import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useEngagements } from '../hooks/useEngagements.js';
import { SERVICES } from '../data/services.js';

const REQUIRED = ['clientName', 'company', 'primaryContact', 'email', 'startDate', 'owner', 'targetOutcome'];

const INITIAL_FORM = {
  clientName: '',
  company: '',
  primaryContact: '',
  email: '',
  serviceTypes: [],
  startDate: '',
  owner: '',
  targetOutcome: '',
  notes: '',
};

export function NewEngagement() {
  const [form, setForm] = useState(INITIAL_FORM);
  const [errors, setErrors] = useState({});
  const { addEngagement } = useEngagements();
  const navigate = useNavigate();

  function validate() {
    const errs = {};
    REQUIRED.forEach(key => {
      if (!form[key].trim()) errs[key] = 'Required';
    });
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errs.email = 'Enter a valid email address';
    }
    if (form.serviceTypes.length === 0) {
      errs.serviceTypes = 'Select at least one service';
    }
    return errs;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: undefined }));
  }

  function toggleService(key) {
    setForm(prev => {
      const next = prev.serviceTypes.includes(key)
        ? prev.serviceTypes.filter(k => k !== key)
        : [...prev.serviceTypes, key];
      return { ...prev, serviceTypes: next };
    });
    if (errors.serviceTypes) setErrors(prev => ({ ...prev, serviceTypes: undefined }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    const id = addEngagement(form);
    navigate(`/engagements/${id}`);
  }

  const inputClass = name =>
    `w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
      errors[name] ? 'border-red-400' : 'border-gray-300'
    }`;

  function FieldError({ name }) {
    return errors[name] ? <p className="text-xs text-red-500 mt-1">{errors[name]}</p> : null;
  }

  function Label({ htmlFor, text, required }) {
    return (
      <label htmlFor={htmlFor ?? undefined} className="block text-sm font-medium text-gray-700 mb-1">
        {text}{required && <span className="text-red-500 ml-1">*</span>}
      </label>
    );
  }

  return (
    <div className="max-w-2xl">
      <div className="mb-6">
        <Link to="/" className="text-sm text-gray-400 hover:text-gray-600">← Dashboard</Link>
        <h1 className="text-2xl font-bold text-gray-900 mt-2">New Engagement</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <Label htmlFor="clientName" text="Client Name" required />
          <input id="clientName" name="clientName" type="text" value={form.clientName} onChange={handleChange} className={inputClass('clientName')} />
          <FieldError name="clientName" />
        </div>

        <div>
          <Label htmlFor="company" text="Company" required />
          <input id="company" name="company" type="text" value={form.company} onChange={handleChange} className={inputClass('company')} />
          <FieldError name="company" />
        </div>

        <div>
          <Label htmlFor="primaryContact" text="Primary Contact" required />
          <input id="primaryContact" name="primaryContact" type="text" value={form.primaryContact} onChange={handleChange} className={inputClass('primaryContact')} />
          <FieldError name="primaryContact" />
        </div>

        <div>
          <Label htmlFor="email" text="Email" required />
          <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputClass('email')} />
          <FieldError name="email" />
        </div>

        <div>
          <Label text="Service Type(s)" required />
          <div className={`flex flex-wrap gap-2 mt-1 rounded-md p-2 border ${errors.serviceTypes ? 'border-red-400' : 'border-gray-300'}`}>
            {SERVICES.map(s => {
              const selected = form.serviceTypes.includes(s.key);
              return (
                <button
                  key={s.key}
                  type="button"
                  onClick={() => toggleService(s.key)}
                  className={`text-sm px-3 py-1.5 rounded-full border font-medium transition-colors ${
                    selected
                      ? 'bg-indigo-600 border-indigo-600 text-white'
                      : 'border-gray-300 text-gray-600 hover:border-indigo-400 hover:text-indigo-600'
                  }`}
                >
                  {s.label}
                </button>
              );
            })}
          </div>
          {errors.serviceTypes && <p className="text-xs text-red-500 mt-1">{errors.serviceTypes}</p>}
        </div>

        <div>
          <Label htmlFor="startDate" text="Start Date" required />
          <input id="startDate" name="startDate" type="date" value={form.startDate} onChange={handleChange} className={inputClass('startDate')} />
          <FieldError name="startDate" />
        </div>

        <div>
          <Label htmlFor="owner" text="Owner" required />
          <input id="owner" name="owner" type="text" value={form.owner} onChange={handleChange} className={inputClass('owner')} />
          <FieldError name="owner" />
        </div>

        <div>
          <Label htmlFor="targetOutcome" text="Target Outcome" required />
          <textarea
            id="targetOutcome"
            name="targetOutcome"
            value={form.targetOutcome}
            onChange={handleChange}
            rows={3}
            className={inputClass('targetOutcome')}
          />
          <FieldError name="targetOutcome" />
        </div>

        <div>
          <Label htmlFor="notes" text="Notes" />
          <textarea
            id="notes"
            name="notes"
            value={form.notes}
            onChange={handleChange}
            rows={3}
            className={inputClass('notes')}
          />
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-indigo-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition-colors"
          >
            Create Engagement
          </button>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="border border-gray-300 text-gray-600 px-5 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
