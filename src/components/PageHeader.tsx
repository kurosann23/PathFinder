type PageHeaderProps = {
  title: string
  subtitle?: string
}

export function PageHeader(props: PageHeaderProps) {
  const { title, subtitle } = props

  return (
    <header className="space-y-1">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-100 md:text-3xl">
        {title}
      </h1>
      {subtitle && <p className="text-sm text-slate-400">{subtitle}</p>}
    </header>
  )
}


