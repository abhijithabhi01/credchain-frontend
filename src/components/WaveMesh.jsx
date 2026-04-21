import { useEffect, useRef } from 'react'
import * as THREE from 'three'

export default function WaveMesh({ style = {} }) {
  const mountRef = useRef(null)

  useEffect(() => {
    const el = mountRef.current
    if (!el) return

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 1)
    renderer.setSize(el.clientWidth, el.clientHeight)
    el.appendChild(renderer.domElement)

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(45, el.clientWidth / el.clientHeight, 0.1, 100)
    camera.position.set(0, 14, 20)
    camera.lookAt(0, -2, 0)

    const SEG = 100
    const W = 80, D = 80

    const makeWireMesh = (colA, colB, opacity, offsetZ = 0) => {
      const geo = new THREE.PlaneGeometry(W, D, SEG, SEG)
      geo.rotateX(-Math.PI / 2)
      const mat = new THREE.ShaderMaterial({
        uniforms: { time: { value: 0 } },
        vertexShader: `
          varying float vHeight;
          void main() {
            vHeight = position.y;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `,
        fragmentShader: `
          varying float vHeight;
          uniform float time;
          void main() {
            float t = clamp((vHeight + 3.5) / 7.0, 0.0, 1.0);
            vec3 a = vec3(${colA});
            vec3 b = vec3(${colB});
            vec3 col = mix(a, b, t);
            float alpha = 0.15 + t * 0.55;
            gl_FragColor = vec4(col, alpha * ${opacity.toFixed(2)});
          }
        `,
        transparent: true,
        wireframe: true,
      })
      const mesh = new THREE.Mesh(geo, mat)
      mesh.position.z = offsetZ
      return mesh
    }

    // Pink→purple layer
    const m1 = makeWireMesh('0.55, 0.06, 0.98', '0.88, 0.25, 0.98', 0.85, 0)
    // Cyan→teal layer (slightly offset)
    const m2 = makeWireMesh('0.0, 0.82, 0.90', '0.22, 0.60, 0.98', 0.55, 6)

    scene.add(m1, m2)

    let t = 0
    let raf

    const animateVerts = (mesh, speed, scaleA, scaleB) => {
      const pos = mesh.geometry.attributes.position
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i)
        const z = pos.getZ(i)
        const y = Math.sin(x * 0.22 + t * speed) * Math.cos(z * 0.18 + t * speed * 0.7) * scaleA
              + Math.sin(x * 0.1 - t * speed * 0.6) * scaleB
        pos.setY(i, y)
      }
      pos.needsUpdate = true
    }

    const tick = () => {
      t += 0.004
      animateVerts(m1, 1.0, 2.8, 1.2)
      animateVerts(m2, 0.75, 2.2, 1.5)
      renderer.render(scene, camera)
      raf = requestAnimationFrame(tick)
    }
    tick()

    const onResize = () => {
      if (!el) return
      renderer.setSize(el.clientWidth, el.clientHeight)
      camera.aspect = el.clientWidth / el.clientHeight
      camera.updateProjectionMatrix()
    }
    window.addEventListener('resize', onResize)

    return () => {
      cancelAnimationFrame(raf)
      window.removeEventListener('resize', onResize)
      renderer.dispose()
      if (el.contains(renderer.domElement)) el.removeChild(renderer.domElement)
    }
  }, [])

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, zIndex: 0, ...style }}
    />
  )
}
