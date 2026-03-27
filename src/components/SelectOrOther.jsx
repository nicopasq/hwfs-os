import { useState } from 'react';

/**
 * SelectOrOther — drop-in replacement for a <select> that adds an
 * "Other…" option. When chosen (or when the current value isn't in
 * the predefined list), a text input appears for custom entry.
 *
 * Props
 *   options     string[]   predefined choices
 *   value       string     controlled value
 *   onChange    fn(string) called with the final string (not an event)
 *   style       object     applied to both <select> and the text <input>
 *   placeholder string     placeholder for the custom input
 */
export default function SelectOrOther({ options, value, onChange, style, placeholder = "Specify…" }) {
  const isCustom = value !== undefined && value !== '' && !options.includes(value);
  const [showInput, setShowInput] = useState(isCustom);

  const handleSelect = e => {
    if (e.target.value === '__other__') {
      setShowInput(true);
      onChange('');
    } else {
      setShowInput(false);
      onChange(e.target.value);
    }
  };

  return (
    <>
      <select
        style={style}
        value={showInput ? '__other__' : (value || '')}
        onChange={handleSelect}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
        <option value="__other__">Other…</option>
      </select>
      {showInput && (
        <input
          style={{ ...style, marginTop: 4 }}
          value={value || ''}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          autoFocus
        />
      )}
    </>
  );
}
