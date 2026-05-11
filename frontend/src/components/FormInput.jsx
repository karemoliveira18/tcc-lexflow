import React from 'react';

const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  options = [],
  error,
  className = ''
}) => {
  return (
    <div className={`form-group ${className}`}>
      {label && <label className="form-label">{label}</label>}

      {type === 'select' ? (
        <select
          value={value}
          onChange={onChange}
          className="form-select"
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className="form-input"
        />
      )}

      {error && (
        <div className="alert alert-error mt-2">
          <span className="text-xs">{error}</span>
        </div>
      )}
    </div>
  );
};

export default FormInput;
