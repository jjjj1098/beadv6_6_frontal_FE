// Generic labeled field wrapper used across the create forms.
export function Field({ label, required, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1.5 flex items-center gap-1 text-sm font-semibold text-foreground">
        {label}
        {required && <span className="text-teal">*</span>}
        {hint && <span className="ml-auto text-xs font-normal text-muted-foreground">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const baseInput =
  "w-full rounded-xl bg-card px-3.5 py-3 text-sm text-foreground outline-none ring-1 ring-border placeholder:text-muted-foreground focus:ring-2 focus:ring-teal"

export function TextInput(props) {
  return <input {...props} className={`${baseInput} ${props.className || ""}`} />
}

export function TextArea(props) {
  return <textarea {...props} className={`${baseInput} resize-none ${props.className || ""}`} />
}

export function Select({ options, ...props }) {
  return (
    <select {...props} className={`${baseInput} appearance-none ${props.className || ""}`}>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  )
}
