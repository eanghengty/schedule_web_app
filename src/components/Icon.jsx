/**
 * Thin wrapper around Material Symbols Outlined.
 * Usage: <Icon name="edit" size={18} />
 */
export default function Icon({ name, size = 18, style = {}, className = '' }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontSize: size, ...style }}
    >
      {name}
    </span>
  );
}
