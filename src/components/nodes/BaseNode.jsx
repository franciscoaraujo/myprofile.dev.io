import React from 'react';

export default function BaseNode({
  id,
  icon,
  iconColor,
  title,
  subtitle,
  glowClass,
  extraClasses = '',
  children,
}) {
  return (
    <div id={id} className={`node ${glowClass} ${extraClasses}`}>
      {children}
      <i className={`${icon} node-icon ${iconColor}`}></i>
      <span className="node-title">{title}</span>
      <span className="node-subtitle">{subtitle}</span>
    </div>
  );
}

