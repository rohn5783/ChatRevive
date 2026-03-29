import { motion, useReducedMotion } from 'framer-motion'

const motionTags = {
  article: motion.article,
  aside: motion.aside,
  div: motion.div,
  form: motion.form,
  header: motion.header,
  main: motion.main,
  nav: motion.nav,
  section: motion.section,
}

export function MotionReveal({
  as = 'div',
  children,
  className,
  delay = 0,
  distance = 28,
  mode = 'view',
  once = true,
  amount = 0.2,
  ...props
}) {
  const prefersReducedMotion = useReducedMotion()
  const Component = motionTags[as] ?? motion.div

  if (prefersReducedMotion) {
    return (
      <Component className={className} {...props}>
        {children}
      </Component>
    )
  }

  const variants = {
    hidden: {
      opacity: 0,
      y: distance,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.62,
        delay,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  }

  if (mode === 'enter') {
    return (
      <Component
        className={className}
        initial="hidden"
        animate="visible"
        variants={variants}
        {...props}
      >
        {children}
      </Component>
    )
  }

  return (
    <Component
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={variants}
      {...props}
    >
      {children}
    </Component>
  )
}
