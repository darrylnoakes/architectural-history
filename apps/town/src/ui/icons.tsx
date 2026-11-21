const base = { width: 18, height: 18, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const;

export const IconPlay = () => (
  <svg {...base} fill="currentColor" stroke="none"><path d="M7 4.5v15a1 1 0 0 0 1.5.86l12.5-7.5a1 1 0 0 0 0-1.72L8.5 3.64A1 1 0 0 0 7 4.5z" /></svg>
);
export const IconPause = () => (
  <svg {...base} fill="currentColor" stroke="none"><rect x="5" y="4" width="5" height="16" rx="1" /><rect x="14" y="4" width="5" height="16" rx="1" /></svg>
);
export const IconClose = () => (
  <svg {...base}><path d="M6 6l12 12M18 6L6 18" /></svg>
);
export const IconLeft = () => (
  <svg {...base}><path d="M15 5l-7 7 7 7" /></svg>
);
export const IconRight = () => (
  <svg {...base}><path d="M9 5l7 7-7 7" /></svg>
);
export const IconOrbit = () => (
  <svg {...base}><circle cx="12" cy="12" r="3" /><ellipse cx="12" cy="12" rx="10" ry="4.5" /></svg>
);
export const IconWalk = () => (
  <svg {...base}><circle cx="13" cy="4.5" r="1.8" /><path d="M9 21l2.5-6.5L9 12l1.5-4.5L14 9l2 3.5 3 .5M11.500 14.500l3.500 2 1 4.500" /></svg>
);
export const IconDrone = () => (
  <svg {...base}><path d="M5 7h4M15 7h4M7 7v3l3 2h4l3-2V7M10 12v3h4v-3" /><path d="M3 7h1M20 7h1" /></svg>
);
export const IconHelp = () => (
  <svg {...base}><circle cx="12" cy="12" r="9.5" /><path d="M9.300 9a2.800 2.800 0 1 1 3.900 2.600c-.8.400-1.200 1-1.200 1.900M12 17.200v.1" /></svg>
);
export const IconStreet = () => (
  <svg {...base}><path d="M3 20h18M5 20v-7l3-2.500 3 2.500v7M13 20V8l3-2.500L19 8v12" /></svg>
);
export const IconArrowIn = () => (
  <svg {...base} width={14} height={14}><path d="M12 4v14M6 12l6 6 6-6" /></svg>
);
export const IconArrowOut = () => (
  <svg {...base} width={14} height={14}><path d="M12 20V6M6 12l6-6 6 6" /></svg>
);
export const IconHome = () => (
  <svg {...base} width={14} height={14}><path d="M12 5l7 7-7 7-7-7z" /></svg>
);
export const IconDown = () => (
  <svg {...base} width={16} height={16}><path d="M6 9l6 6 6-6" /></svg>
);
export const IconLibrary = () => (
  <svg {...base}><path d="M4 5h4v15H4zM10 5h4v15h-4zM16.500 6l3.500-1 3 14-3.500 1z" /></svg>
);
export const IconCompare = () => (
  <svg {...base}><rect x="3" y="5" width="7.500" height="14" rx="1.500" /><rect x="13.500" y="5" width="7.500" height="14" rx="1.500" /></svg>
);
export const IconList = () => (
  <svg {...base}><path d="M8 6h12M8 12h12M8 18h12M4 6h.01M4 12h.01M4 18h.01" /></svg>
);
export const IconGlobe = () => (
  <svg {...base}><circle cx="12" cy="12" r="9.500" /><path d="M2.500 12h19M12 2.500c3 3 3 16 0 19M12 2.500c-3 3-3 16 0 19" /></svg>
);
export const IconSearch = () => (
  <svg {...base}><circle cx="11" cy="11" r="6.500" /><path d="M16 16l4.500 4.500" /></svg>
);
