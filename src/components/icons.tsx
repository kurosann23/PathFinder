import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & {
  size?: number
}

function baseProps(props: IconProps) {
  const { size = 20, className, ...rest } = props
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    className,
    ...rest,
  } as const
}

export function IconCalendar(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="1.8" />
      <line x1="16" y1="2" x2="16" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="8" y1="2" x2="8" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <line x1="3" y1="10" x2="21" y2="10" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function IconHome(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1v-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconUser(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M20 21a8 8 0 1 0-16 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 12a4 4 0 1 0-4-4 4 4 0 0 0 4 4Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function IconClipboard(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M9 5h6a2 2 0 0 1 2 2v14H7V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 5a3 3 0 0 1 6 0v2H9V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconBook(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M4.5 5.5A2.5 2.5 0 0 1 7 3h13v18H7a2.5 2.5 0 0 0-2.5 2.5V5.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M7 3v18"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconMap(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M9 18 3 21V6l6-3 6 3 6-3v15l-6 3-6-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 3v15M15 6v15"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconGamepad(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M8.5 12H6m1.25-1.25V13.25M16 12h.01M18 11h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M7 17a4 4 0 0 1-4-4V9a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v4a4 4 0 0 1-4 4l-1.5-2H8.5L7 17Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconBell(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M18 8a6 6 0 1 0-12 0c0 7-3 7-3 7h18s-3 0-3-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M10 19a2 2 0 0 0 4 0"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconSearch(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle
        cx="11"
        cy="11"
        r="8"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m21 21-4.3-4.3"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconSettings(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M19.4 15a7.9 7.9 0 0 0 .1-2l2-1.2-2-3.5-2.3.7a8 8 0 0 0-1.7-1L15 5h-6l-.5 2.9a8 8 0 0 0-1.7 1l-2.3-.7-2 3.5 2 1.2a7.9 7.9 0 0 0 .1 2l-2 1.2 2 3.5 2.3-.7a8 8 0 0 0 1.7 1L9 19h6l.5-2.9a8 8 0 0 0 1.7-1l2.3.7 2-3.5-2-1.2Z"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconMoon(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M21 13.2A7.5 7.5 0 0 1 10.8 3a6.5 6.5 0 1 0 10.2 10.2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconSun(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32l1.41 1.41M2 12h2m16 0h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconLogout(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M10 17H6a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M16 12H9m7 0-2.5-2.5M16 12l-2.5 2.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 19V5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        opacity="0.5"
      />
    </svg>
  )
}

export function IconTarget(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 21a9 9 0 1 0-9-9"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 17a5 5 0 1 0-5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 13a1 1 0 1 0-1-1 1 1 0 0 0 1 1Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconPin(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 22s7-4.4 7-12a7 7 0 1 0-14 0c0 7.6 7 12 7 12Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 11a2 2 0 1 0-2-2 2 2 0 0 0 2 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
    </svg>
  )
}

export function IconCheck(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="m20 6-11 11-5-5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// RIASEC Type Icons
export function IconWrench(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      {/* Wrench */}
      <path
        d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Screwdriver handle */}
      <line
        x1="6"
        y1="18"
        x2="10"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconLightbulb(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M9 21h6M12 3a6 6 0 0 1 6 6c0 2.5-1.5 4.5-3 6H9c-1.5-1.5-3-3.5-3-6a6 6 0 0 1 6-6Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 9v3M10 12h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconPalette(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c.55 0 1-.45 1-1v-4H8c-.55 0-1-.45-1-1s.45-1 1-1h5V8c0-.55.45-1 1-1s1 .45 1 1v3h1c.55 0 1 .45 1 1s-.45 1-1 1h-1v3c0 .55.45 1 1 1 .55 0 1-.45 1-1 0-5.52-4.48-10-10-10Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="7.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="16.5" cy="7.5" r="1.5" fill="currentColor" />
      <circle cx="7.5" cy="16.5" r="1.5" fill="currentColor" />
    </svg>
  )
}

export function IconMessageHeart(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      {/* First speech bubble */}
      <path
        d="M8 9a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-4l-2 2v-2H10a2 2 0 0 1-2-2V9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Second overlapping speech bubble */}
      <path
        d="M12 11a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2l-2 2v-2h-2a2 2 0 0 1-2-2v-4Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Heart in first bubble */}
      <path
        d="M10 12c-.5 0-1 .5-1 1 0 1 1 2 1 2s1-1 1-2c0-.5-.5-1-1-1Z"
        fill="currentColor"
      />
      {/* Heart in second bubble */}
      <path
        d="M14 12c-.5 0-1 .5-1 1 0 1 1 2 1 2s1-1 1-2c0-.5-.5-1-1-1Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconBriefcase(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M16 20V4a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 20H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4m8 0h4a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2h-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 8v4m-2-2h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconClipboardCheck(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M9 5h6a2 2 0 0 1 2 2v14H7V7a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M9 5a3 3 0 0 1 6 0v2H9V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconQuestion(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconArrowRight(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M5 12h14m-7-7 7 7-7 7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconChevronDown(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="m6 9 6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconChevronUp(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="m18 15-6-6-6 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconX(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="m18 6-12 12M6 6l12 12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconShield(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 2L4 5v6c0 5.55 3.84 10.74 8 12 4.16-1.26 8-6.45 8-12V5l-8-3Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="m9 12 2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconMegaphone(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M3 8v8l6-4v4l6-2V6L9 4v4L3 8Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M15 8a3 3 0 1 1 0 6"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconRocket(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M4.5 16.5c-1.5-1.5-2-4-1.5-5.5L8 4l7 7-2.5 2.5L12 14l-2.5 2.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M12 14l-2 2M14 12l2-2M16 16l2 2M18 18l2 2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 20a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function IconBrowser(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <rect
        x="3"
        y="5"
        width="18"
        height="14"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M3 8h18M8 5V8"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M12 12h6M12 15h4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconFolder(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M4 7v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-6l-2-2H6a2 2 0 0 0-2 2Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconFolderDashed(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M4 20h16a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-7l-2-2H4a1 1 0 0 0-1 1v11a1 1 0 0 0 1 1Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path d="M8 12h8M8 16h5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconPlus(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M12 5v14M5 12h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconEdit(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m18.5 2.5 3 3L12 15l-4 1 1-4 9.5-9.5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconTrash(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M10 11v6M14 11v6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

export function IconUsers(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <path
        d="M9 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Z"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function IconMail(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M4 7.5A2.5 2.5 0 0 1 6.5 5h11A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-9Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
      <path
        d="M6.5 7.5 12 12l5.5-4.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconEye(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="3" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  )
}

export function IconEyeOff(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M9.88 9.88a3 3 0 1 0 4.24 4.24M10.73 5.05A10.51 10.51 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61M2 2l20 20"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconUpload(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m17 8-5-5-5 5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 3v12"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function IconPhone(props: IconProps) {
  return (
    <svg {...baseProps(props)}>
      <path
        d="M3 5a2 2 0 0 1 2-2h3.28a1 1 0 0 1 .948.684l1.498 4.493a1 1 0 0 1-.502 1.21l-2.257 1.13a11.042 11.042 0 0 0 5.516 5.516l1.13-2.257a1 1 0 0 1 1.21-.502l4.493 1.498a1 1 0 0 1 .684.949V19a2 2 0 0 1-2 2h-1C9.716 21 3 14.284 3 6V5Z"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinejoin="round"
      />
    </svg>
  )
}


