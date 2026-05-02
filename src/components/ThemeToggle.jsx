import Icon from './Icon';

export default function ThemeToggle({ theme, onToggle }) {
  return (
    <button
      className="btn-theme no-print"
      onClick={onToggle}
      title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
    >
      <Icon name={theme === 'dark' ? 'light_mode' : 'dark_mode'} size={18} />
    </button>
  );
}
