import { motion, useReducedMotion } from 'framer-motion'
import './AppButton.scss'

const MotionButton = motion.button

export function AppButton({
  children,
  type = 'button',
  variant = 'primary',
  disabled = false,
  onClick,
}) {
  const prefersReducedMotion = useReducedMotion()

  return (
    <MotionButton
      type={type}
      className={`app-button app-button--${variant}`}
      disabled={disabled}
      onClick={onClick}
      whileHover={
        disabled || prefersReducedMotion
          ? undefined
          : {
              y: -2,
              scale: 1.01,
              transition: { duration: 0.18, ease: 'easeOut' },
            }
      }
      whileTap={
        disabled || prefersReducedMotion
          ? undefined
          : {
              y: 0,
              scale: 0.985,
              transition: { duration: 0.12, ease: 'easeOut' },
            }
      }
    >
      <span>{children}</span>
    </MotionButton>
  )
}
