import React from 'react';

const Button = ({
  children,
  onClick,
  disabled,
  className = '',
  type = 'button',
  variant = 'primary',
  size = 'base',
  icon
}) => {
  const getButtonClasses = () => {
    let classes = 'btn ';

    // Variant classes
    switch (variant) {
      case 'primary':
        classes += 'btn-primary ';
        break;
      case 'secondary':
        classes += 'btn-secondary ';
        break;
      case 'ghost':
        classes += 'btn-ghost ';
        break;
      default:
        classes += 'btn-primary ';
    }

    // Size classes
    switch (size) {
      case 'sm':
        classes += 'btn-sm ';
        break;
      default:
        // base size is default
        break;
    }

    // Disabled state
    if (disabled) {
      classes += 'opacity-60 cursor-not-allowed ';
    }

    // Custom className
    classes += className;

    return classes.trim();
  };

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={getButtonClasses()}
    >
      {icon}
      {children}
    </button>
  );
};

export default Button;
