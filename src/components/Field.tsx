import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

export function Field({ label, hint, error, ...props }: InputHTMLAttributes<HTMLInputElement> & { label: string; hint?: string; error?: string }) {
  const id = useId()
  return <div className="field"><label htmlFor={id}>{label}</label><input id={id} {...props} aria-invalid={!!error} aria-describedby={hint || error ? `${id}-help` : undefined} />{(error || hint) && <small id={`${id}-help`} className={error ? 'field-error' : ''}>{error || hint}</small>}</div>
}
export function Select({ label, children, value, onChange }: { label: string; children: ReactNode; value: string; onChange: (value: string) => void }) {
  const id = useId()
  return <label className="field" htmlFor={id}><span>{label}</span><select id={id} value={value} onChange={e => onChange(e.target.value)}>{children}</select></label>
}
