'use client';

import { useEffect, useRef } from 'react';

/**
 * Global iridescent WebGL backdrop (nebula), fixed behind all content.
 * Ported from the AST design artifact — one instance mounted in the root layout,
 * so every page shares the same background + readability veil.
 * Falls back to a CSS radial gradient when WebGL is unavailable, and renders a
 * single static frame under prefers-reduced-motion.
 */
export function GlobalBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const reduce =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const gl = (canvas.getContext('webgl') ||
      canvas.getContext('experimental-webgl')) as WebGLRenderingContext | null;

    if (!gl) {
      canvas.style.background =
        'radial-gradient(120% 90% at 30% 10%,#243b7a,#0a0c22 55%,#05060f)';
      return;
    }

    const vs = 'attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}';
    const fs = [
      'precision highp float;',
      'uniform vec2 u_res;uniform float u_time;uniform float u_scroll;uniform vec2 u_mouse;',
      'float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}',
      'float noise(vec2 p){vec2 i=floor(p),f=fract(p);vec2 u=f*f*(3.-2.*f);',
      'return mix(mix(hash(i),hash(i+vec2(1,0)),u.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),u.x),u.y);}',
      'float fbm(vec2 p){float v=0.,a=.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.02;a*=.5;}return v;}',
      'vec3 pal(float t,vec3 d){return .5+.5*cos(6.28318*(vec3(1.0)*t+d));}',
      'void main(){',
      ' vec2 uv=gl_FragCoord.xy/u_res;',
      ' vec2 p=uv;p.x*=u_res.x/u_res.y;',
      ' float t=u_time*0.045+u_scroll*2.2;',
      ' vec2 m=(u_mouse-0.5)*0.35;',
      ' vec2 q=vec2(fbm(p*1.6+t+m),fbm(p*1.6+vec2(5.2,1.3)-t*0.8));',
      ' vec2 r=vec2(fbm(p*1.6+q*2.4+vec2(1.7,9.2)+0.12*t),fbm(p*1.6+q*2.4+vec2(8.3,2.8)-0.10*t));',
      ' float f=fbm(p*1.6+r*2.4);',
      ' vec3 c1=pal(f+u_scroll*0.6, vec3(0.60,0.42,0.30));',
      ' vec3 c2=pal(length(q)+0.15*u_time*0.04+u_scroll, vec3(0.30,0.55,0.75));',
      ' vec3 col=mix(c1,c2,smoothstep(0.2,0.9,r.x));',
      ' col=mix(col, vec3(0.55,0.75,1.0), 0.18*pow(f,2.0));',
      ' col*=0.40+0.68*f;',
      ' col=pow(col, vec3(1.25));',
      ' float vig=smoothstep(1.35,0.25,length(uv-0.5));',
      ' col*=0.35+0.65*vig;',
      ' col+=0.03*hash(gl_FragCoord.xy+u_time);',
      ' gl_FragColor=vec4(col,1.0);',
      '}',
    ].join('\n');

    function sh(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uRes = gl.getUniformLocation(prog, 'u_res');
    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uScroll = gl.getUniformLocation(prog, 'u_scroll');
    const uMouse = gl.getUniformLocation(prog, 'u_mouse');

    const dpr = Math.min(window.devicePixelRatio || 1, 1.8);
    function resize() {
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      gl!.viewport(0, 0, canvas!.width, canvas!.height);
    }
    resize();
    window.addEventListener('resize', resize);

    let scroll = 0;
    let tScroll = 0;
    let mx = 0.5;
    let my = 0.5;
    let tmx = 0.5;
    let tmy = 0.5;

    const onScroll = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      tScroll = max > 0 ? window.scrollY / max : 0;
    };
    const onPointer = (e: PointerEvent) => {
      tmx = e.clientX / window.innerWidth;
      tmy = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('pointermove', onPointer, { passive: true });

    let raf = 0;
    let start: number | null = null;
    function frame(ts: number) {
      if (start === null) start = ts;
      const time = (ts - start) / 1000;
      scroll += (tScroll - scroll) * 0.06;
      mx += (tmx - mx) * 0.05;
      my += (tmy - my) * 0.05;
      gl!.uniform2f(uRes, canvas!.width, canvas!.height);
      gl!.uniform1f(uTime, reduce ? 8.0 : time);
      gl!.uniform1f(uScroll, scroll);
      gl!.uniform2f(uMouse, mx, my);
      gl!.drawArrays(gl!.TRIANGLES, 0, 3);
      if (!reduce) raf = requestAnimationFrame(frame);
    }
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('resize', resize);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('pointermove', onPointer);
    };
  }, []);

  return (
    <>
      <canvas id="gl" ref={canvasRef} aria-hidden="true" />
      <div id="veil" aria-hidden="true" />
    </>
  );
}
