import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

export function Icon({ size = 20, children, ...props }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}>
      {children}
    </svg>
  )
}

export const BlocksIcon = (props: IconProps) => <Icon {...props}><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></Icon>
export const MarketIcon = (props: IconProps) => <Icon {...props}><path d="M3 19V5"/><path d="m6 16 4-5 4 3 6-8"/><path d="M17 6h3v3"/></Icon>
export const FeesIcon = (props: IconProps) => <Icon {...props}><path d="M12 2v20M17 5.5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></Icon>
export const SearchIcon = (props: IconProps) => <Icon {...props}><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></Icon>
export const BellIcon = (props: IconProps) => <Icon {...props}><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9"/><path d="M10 21h4"/></Icon>
export const MenuIcon = (props: IconProps) => <Icon {...props}><path d="M4 7h16M4 12h16M4 17h16"/></Icon>
export const CloseIcon = (props: IconProps) => <Icon {...props}><path d="m6 6 12 12M18 6 6 18"/></Icon>
export const ArrowIcon = (props: IconProps) => <Icon {...props}><path d="M5 12h14M13 6l6 6-6 6"/></Icon>
export const ExternalIcon = (props: IconProps) => <Icon {...props}><path d="M15 3h6v6M10 14 21 3M18 13v7a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h7"/></Icon>
export const ChevronIcon = (props: IconProps) => <Icon {...props}><path d="m9 18 6-6-6-6"/></Icon>
export const ActivityIcon = (props: IconProps) => <Icon {...props}><path d="M3 12h4l2-8 4 16 2-8h6"/></Icon>
export const FuelIcon = (props: IconProps) => <Icon {...props}><path d="M3 22V5a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v17M2 22h14M6 7h6M18 7l3 3v8a2 2 0 0 1-4 0v-5h-2"/></Icon>
export const ClockIcon = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></Icon>
export const CubeIcon = (props: IconProps) => <Icon {...props}><path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z"/><path d="m4.5 7.7 7.5 4.2 7.5-4.2M12 12v9"/></Icon>
export const InfoIcon = (props: IconProps) => <Icon {...props}><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></Icon>
export const LinkIcon = (props: IconProps) => <Icon {...props}><path d="M10 13a5 5 0 0 0 7.5.5l2-2a5 5 0 0 0-7-7l-1.2 1.2"/><path d="M14 11a5 5 0 0 0-7.5-.5l-2 2a5 5 0 0 0 7 7l1.2-1.2"/></Icon>
export const BookIcon = (props: IconProps) => <Icon {...props}><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20V3H6.5A2.5 2.5 0 0 0 4 5.5v14Z"/><path d="M8 7h8M8 11h6"/></Icon>
export const ShieldIcon = (props: IconProps) => <Icon {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></Icon>
