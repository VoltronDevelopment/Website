type IconProps = {
  name: string;
  className?: string;
};

const stroke = {
  fill: "none" as const,
  stroke: "currentColor",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  strokeWidth: 1.6
};

export function SectionIcon({ name, className = "" }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={`section-icon ${className}`.trim()} aria-hidden="true">
      {renderIcon(name)}
    </svg>
  );
}

function renderIcon(name: string) {
  switch (name) {
    case "customer":
      return (
        <>
          <circle {...stroke} cx="9" cy="9" r="2.5" />
          <circle {...stroke} cx="15.5" cy="10" r="2" />
          <path {...stroke} d="M4 20c0-3 2.5-5.5 5.5-5.5S13 17 13 20M13.5 16.5c2.8 0 5.5 2 5.5 5.5" />
        </>
      );
    case "part":
      return <rect {...stroke} x="5" y="6" width="14" height="12" rx="2" />;
    case "requirement":
      return (
        <>
          <rect {...stroke} x="6" y="5" width="12" height="14" rx="2" />
          <path {...stroke} d="m9 10 2 2 4-4" />
        </>
      );
    case "process":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="3" />
          <path {...stroke} d="M12 3v2.2M12 18.8V21M3 12h2.2M18.8 12H21M5.8 5.8l1.6 1.6M16.6 16.6l1.6 1.6M5.8 18.2l1.6-1.6M16.6 7.4l1.6-1.6" />
        </>
      );
    case "shield":
      return (
        <>
          <path {...stroke} d="M12 3 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-3z" />
          <path {...stroke} d="m9 11 2 2 4-4" />
        </>
      );
    case "lot":
      return (
        <>
          <rect {...stroke} x="5" y="5" width="6" height="6" rx="1" />
          <rect {...stroke} x="13" y="5" width="6" height="6" rx="1" />
          <rect {...stroke} x="5" y="13" width="6" height="6" rx="1" />
          <rect {...stroke} x="13" y="13" width="6" height="6" rx="1" />
        </>
      );
    case "gauge":
      return (
        <>
          <path {...stroke} d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
          <path {...stroke} d="M12 4v2M6 7l1.5 1.5M18 7l-1.5 1.5M4 14h2M18 14h2" />
        </>
      );
    case "inspect":
      return (
        <>
          <circle {...stroke} cx="11" cy="11" r="6" />
          <path {...stroke} d="m16 16 5 5" />
        </>
      );
    case "dispatch":
      return (
        <>
          <rect {...stroke} x="3" y="8" width="12" height="8" rx="1" />
          <path {...stroke} d="M15 10h3l3 3v3h-6M7 18a1.5 1.5 0 1 0 0 .01M17 18a1.5 1.5 0 1 0 0 .01" />
        </>
      );
    case "shopfloor":
      return (
        <>
          <path {...stroke} d="M4 20V10l8-5 8 5v10" />
          <path {...stroke} d="M9 20v-6h6v6" />
          <path {...stroke} d="M12 10v3" />
        </>
      );
    case "engineering":
      return (
        <>
          <path {...stroke} d="M9 11h6v8H9z" />
          <path {...stroke} d="M10 11V8.5a2 2 0 0 1 4 0V11" />
          <path {...stroke} d="M8 19h8" />
        </>
      );
    case "engineer":
      return (
        <>
          <path {...stroke} d="M8 9.5 10 7h4l2 2.5" />
          <circle {...stroke} cx="12" cy="13" r="2.5" />
          <path {...stroke} d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        </>
      );
    case "chart":
      return <path {...stroke} d="M4 19V5M10 19V9M16 19v-6M20 19V7" />;
    case "target":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="8" />
          <circle {...stroke} cx="12" cy="12" r="3" />
        </>
      );
    case "speedometer":
      return (
        <>
          <path {...stroke} d="M12 4a8 8 0 0 1 8 8" />
          <path {...stroke} d="M12 12l4-2" />
        </>
      );
    case "caliper":
      return <path {...stroke} d="M4 8h16M4 16h16M8 4v16M16 4v16" />;
    case "document":
      return (
        <>
          <path {...stroke} d="M8 4h8l4 4v12H8V4z" />
          <path {...stroke} d="M16 4v4h4" />
        </>
      );
    case "table":
      return (
        <>
          <rect {...stroke} x="4" y="5" width="16" height="14" rx="2" />
          <path {...stroke} d="M4 10h16M10 10v9" />
        </>
      );
    case "beaker":
      return <path {...stroke} d="M9 3h6l-2 9v7H11v-7L9 3z" />;
    case "certificate":
      return (
        <>
          <circle {...stroke} cx="12" cy="10" r="6" />
          <path {...stroke} d="M9 16l-2 5 5-2 5 2-2-5" />
        </>
      );
    case "photo":
      return (
        <>
          <rect {...stroke} x="4" y="6" width="16" height="12" rx="2" />
          <circle {...stroke} cx="9" cy="11" r="1.5" />
          <path {...stroke} d="m4 16 5-5 3 3 4-4 4 6" />
        </>
      );
    case "keyboard":
      return (
        <>
          <rect {...stroke} x="3" y="8" width="18" height="10" rx="2" />
          <path {...stroke} d="M7 12h.01M11 12h.01M15 12h.01" />
        </>
      );
    case "connected":
      return <path {...stroke} d="M12 3 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-3z" />;
    case "contextual":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="8" />
          <path {...stroke} d="M12 8v4l3 2" />
        </>
      );
    case "intelligent":
      return (
        <>
          <path {...stroke} d="M8 9a4 4 0 0 1 8 0c0 2-1 3-2 4v2H10v-2c-1-1-2-2-2-4z" />
          <path {...stroke} d="M10 19h4" />
        </>
      );
    case "actionable":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="8" />
          <path {...stroke} d="m8 12 2.5 2.5L16 9" />
        </>
      );
    case "continuous":
      return <path {...stroke} d="M4 16c2-4 4-6 8-6s6 2 8 6M4 12c2-3 4-4 8-4s6 1 8 4" />;
    case "prompt":
      return <path {...stroke} d="M6 8h12v8H9l-3 3V8z" />;
    case "network":
      return (
        <>
          <circle {...stroke} cx="6" cy="12" r="2" />
          <circle {...stroke} cx="18" cy="6" r="2" />
          <circle {...stroke} cx="18" cy="18" r="2" />
          <path {...stroke} d="M8 12h8M16.5 7.5 8 10.5M16.5 16.5 8 13.5" />
        </>
      );
    case "response":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="8" />
          <path {...stroke} d="m8 12 2.5 2.5L16 9" />
        </>
      );
    case "state":
      return <path {...stroke} d="M4 19V5M10 19V9M16 19v-6M20 19V7" />;
    case "history":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="8" />
          <path {...stroke} d="M12 8v4l3 2" />
        </>
      );
    case "evidence":
      return (
        <>
          <path {...stroke} d="M8 4h8l4 4v12H8V4z" />
          <path {...stroke} d="M16 4v4h4" />
        </>
      );
    case "equipment":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="3" />
          <path {...stroke} d="M12 3v2M12 19v2M3 12h2M19 12h2M7 7l1.4 1.4M15.6 15.6 17 17M7 17l1.4-1.4M15.6 7 17 5.6" />
          <path {...stroke} d="M12 9v6" />
        </>
      );
    case "ncr":
      return (
        <>
          <path {...stroke} d="M12 3 4 6v6c0 4.5 3.4 7.7 8 9 4.6-1.3 8-4.5 8-9V6l-8-3z" />
          <path {...stroke} d="M12 8v4M12 16h.01" />
        </>
      );
    case "visibility":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="3" />
          <path {...stroke} d="M12 3v2M12 19v2M3 12h2M19 12h2M5.6 5.6l1.4 1.4M17 17l1.4 1.4M5.6 18.4 7 17M17 7l1.4-1.4" />
        </>
      );
    case "brain":
      return (
        <>
          <path {...stroke} d="M9 8.5a3 3 0 0 1 6 0c0 1.6-.8 2.8-1.8 3.7V14H10.8v-1.8C9.8 11.3 9 10.1 9 8.5z" />
          <path {...stroke} d="M10 14h4v2.5c0 .8-.7 1.5-1.5 1.5h-1c-.8 0-1.5-.7-1.5-1.5V14z" />
          <path {...stroke} d="M8 9H6M18 9h-2M8 12H5M19 12h-3" />
        </>
      );
    case "spark":
      return <path {...stroke} d="M12 3l1.5 6L20 12l-6.5 1.5L12 20l-1.5-6.5L4 12l6.5-1.5L12 3z" />;
    case "play":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="8" />
          <path {...stroke} d="M10 8.5v7l6-3.5-6-3.5z" />
        </>
      );
    case "hypothesis":
      return (
        <>
          <circle {...stroke} cx="12" cy="12" r="8" />
          <circle {...stroke} cx="12" cy="12" r="2" />
        </>
      );
    case "human":
      return (
        <>
          <circle {...stroke} cx="12" cy="8" r="3" />
          <path {...stroke} d="M6 20c0-3.3 2.7-6 6-6s6 2.7 6 6" />
        </>
      );
    case "hexagon":
      return <path {...stroke} d="M12 3 20 8v8l-8 5-8-5V8l8-5z" />;
    case "cube":
      return (
        <>
          <path {...stroke} d="M12 4 20 8.5v7L12 20 4 15.5v-7L12 4z" />
          <path {...stroke} d="M12 20v-7.5M4 8.5 12 12.5 20 8.5" />
        </>
      );
    default:
      return <circle {...stroke} cx="12" cy="12" r="6" />;
  }
}
