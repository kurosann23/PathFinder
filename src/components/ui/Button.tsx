import type { ButtonHTMLAttributes } from 'react'
import { buttonClasses, type ButtonSize, type ButtonVariant } from './buttonStyles'

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
}

export function Button(props: ButtonProps) {
  const { variant, size, fullWidth, className, ...rest } = props
  return (
    <button
      {...rest}
      className={buttonClasses({ variant, size, fullWidth, className })}
    />
  )
}


