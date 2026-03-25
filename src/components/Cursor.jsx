import { useEffect, useRef } from 'react'

export default function Cursor() {
  const dot = useRef(null)
  const ring = useRef(null)
  const mx = useRef(0), my = useRef(0)
  const rx = useRef(0), ry = useRef(0)

  useEffect(() => {
    const move = (e) => {
      mx.current = e.clientX
      my.current = e.clientY
      if (dot.current) {
        dot.current.style.left = e.clientX + 'px'
        dot.current.style.top = e.clientY + 'px'
      }
    }
    window.addEventListener('mousemove', move)

    let raf
    const animate = () => {
      rx.current += (mx.current - rx.current) * 0.12
      ry.current += (my.current - ry.current) * 0.12
      if (ring.current) {
        ring.current.style.left = rx.current + 'px'
        ring.current.style.top = ry.current + 'px'
      }
      raf = requestAnimationFrame(animate)
    }
    animate()

    const hover = () => {
      if (dot.current) dot.current.style.transform = 'translate(-50%,-50%) scale(0.5)'
      if (ring.current) {
        ring.current.style.width = '60px'
        ring.current.style.height = '60px'
        ring.current.style.borderColor = 'rgba(224,64,251,0.5)'
      }
    }
    const leave = () => {
      if (dot.current) dot.current.style.transform = 'translate(-50%,-50%) scale(1)'
      if (ring.current) {
        ring.current.style.width = '40px'
        ring.current.style.height = '40px'
        ring.current.style.borderColor = 'rgba(255,255,255,0.25)'
      }
    }

    const els = document.querySelectorAll('button, a, [data-hover], .role-card-item')
    els.forEach(el => { el.addEventListener('mouseenter', hover); el.addEventListener('mouseleave', leave) })

    return () => {
      window.removeEventListener('mousemove', move)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <>
      <div ref={dot} className="cursor" />
      <div ref={ring} className="cursor-ring" />
    </>
  )
}
