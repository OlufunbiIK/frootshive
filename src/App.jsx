import { useState, useEffect, useRef } from 'react'
import './styles.css'
import SvgDefs from './SvgDefs.jsx'
import { LOGO, PH } from './assets'
import { FORM_ACTION, ENTRY, SOCIAL } from './config'
import { CH, DET, RL, L, ROM, pad, S, BACKDROP } from './data'

const ph = (n) => PH[((n % PH.length) + PH.length) % PH.length]

/* ---------- small presentational pieces ---------- */

function Backdrop() {
  return (
    <div className="bg">
      {BACKDROP.map(([id, pos, w, r, d, c], idx) => (
        <svg
          key={idx}
          className={`fl ${c || ''}`}
          viewBox="0 0 100 100"
          style={{ ...pos, width: w, height: w, '--r': `${r}deg`, animationDelay: `${d}s` }}
        >
          <use href={`#${id}`} />
        </svg>
      ))}
    </div>
  )
}

/* one arch that cross-fades through the photo set */
function Arch({ k, start }) {
  const [t, setT] = useState(0)
  useEffect(() => {
    let iv
    const to = setTimeout(() => {
      iv = setInterval(() => setT((x) => x + 1), 5200)
    }, k * 1300)
    return () => {
      clearTimeout(to)
      clearInterval(iv)
    }
  }, [k])
  const active = t % 2
  return (
    <div className={`arch a${k}`}>
      {[0, 1].map((slot) => (
        <img
          key={slot}
          alt=""
          className={slot === active ? 'on' : ''}
          src={ph(start + (slot === active ? t : t - 1))}
        />
      ))}
    </div>
  )
}

function Tri({ className = 'tri' }) {
  const starts = [3, 0, 6]
  return (
    <div className={className}>
      {starts.map((s, k) => (
        <Arch key={k} k={k} start={s} />
      ))}
    </div>
  )
}

function Rate({ value, onChange, className = 'rate' }) {
  return (
    <div className={className}>
      {[1, 2, 3, 4, 5].map((x) => (
        <button
          key={x}
          type="button"
          aria-label={x}
          className={x <= value ? 'on' : ''}
          onClick={() => onChange(x)}
        >
          <svg viewBox="0 0 48 48">
            <use href="#slice" />
          </svg>
        </button>
      ))}
    </div>
  )
}

function Confetti({ run }) {
  const ref = useRef(null)
  useEffect(() => {
    if (!run) return
    const cv = ref.current
    const x = cv.getContext('2d')
    cv.width = innerWidth
    cv.height = innerHeight
    const em = ['🍓', '🍊', '🥝', '🍒', '🍋', '🍍', '🍉']
    const c = ['#c8a04a', '#2d7a49', '#e8704f', '#f1d98a']
    const p = Array.from({ length: 60 }, () => ({
      x: Math.random() * cv.width,
      y: -Math.random() * cv.height * 0.7,
      v: 1.8 + Math.random() * 3,
      r: Math.random() * 6,
      s: 18 + Math.random() * 14,
      e: Math.random() > 0.45 ? em[(Math.random() * em.length) | 0] : null,
      c: c[(Math.random() * c.length) | 0],
    }))
    let t = 0
    let raf
    const f = () => {
      x.clearRect(0, 0, cv.width, cv.height)
      t++
      p.forEach((q) => {
        q.y += q.v
        q.x += Math.sin((t + q.r * 40) / 32) * 1.2
        x.save()
        x.translate(q.x, q.y)
        x.rotate(Math.sin(t / 25 + q.r) * 0.6)
        x.globalAlpha = Math.max(0, 1 - t / 380)
        if (q.e) {
          x.font = q.s + 'px serif'
          x.fillText(q.e, 0, 0)
        } else {
          x.fillStyle = q.c
          x.fillRect(-4, -2, 8, 4)
        }
        x.restore()
      })
      if (t < 380) raf = requestAnimationFrame(f)
      else x.clearRect(0, 0, cv.width, cv.height)
    }
    f()
    return () => cancelAnimationFrame(raf)
  }, [run])
  return <canvas id="cv" ref={ref} />
}

/* ---------- the field for the current question ---------- */

function Field({ s, ans, setAns, setDetail, clearErr, onAutoAdvance }) {
  const v = ans[s.k]

  if (['text', 'tel', 'email', 'date'].includes(s.type)) {
    return (
      <input
        type={s.type}
        placeholder={s.ph || ''}
        value={v || ''}
        autoComplete="off"
        inputMode={s.type === 'tel' ? 'tel' : s.type === 'email' ? 'email' : undefined}
        max={s.type === 'date' ? new Date().toISOString().slice(0, 10) : undefined}
        onChange={(e) => setAns(s.k, e.target.value)}
      />
    )
  }

  if (s.type === 'area') {
    return <textarea placeholder={s.ph} value={v || ''} onChange={(e) => setAns(s.k, e.target.value)} />
  }

  if (s.type === 'radio' || s.type === 'check') {
    const isRadio = s.type === 'radio'
    const arr = isRadio ? [] : v || []
    const hasOther = isRadio ? v === 'Other' : arr.includes('Other')
    const allergies = s.k === 'dietary' && arr.includes('Food allergies')

    const pick = (o) => {
      if (isRadio) {
        setAns(s.k, o)
        if (!s.last && o !== 'Other') onAutoAdvance()
      } else {
        setAns(s.k, arr.includes(o) ? arr.filter((x) => x !== o) : [...arr, o])
      }
      clearErr()
    }

    return (
      <>
        <div className={'opts' + (s.o.length > 5 ? ' two' : '')}>
          {s.o.map((o, j) => (
            <label className="o" key={o}>
              <input
                type={isRadio ? 'radio' : 'checkbox'}
                name={s.k}
                value={o}
                checked={isRadio ? v === o : arr.includes(o)}
                onChange={() => pick(o)}
              />
              <div>
                <kbd>{L[j]}</kbd>
                <span>{o}</span>
              </div>
            </label>
          ))}
        </div>
        <input
          type="text"
          className="other"
          style={{ display: hasOther || allergies ? 'block' : 'none' }}
          placeholder={allergies && !hasOther ? 'Please tell us about your allergies' : 'Please tell us more'}
          value={ans[s.k + '_o'] || ''}
          onChange={(e) => setAns(s.k + '_o', e.target.value)}
        />
      </>
    )
  }

  if (s.type === 'rate') {
    return (
      <>
        <Rate
          value={v || 0}
          onChange={(x) => {
            setAns('rating', x)
            clearErr()
          }}
        />
        <div className="scale">
          <span>1 = Very poor</span>
          <span>5 = Excellent</span>
        </div>
        <div className="rl">{RL[v || 0]}</div>
      </>
    )
  }

  if (s.type === 'multirate') {
    return DET.map((d, j) => (
      <div className="mrow" key={d}>
        <span>{d}</span>
        <Rate className="rate sm" value={ans.details[j] || 0} onChange={(x) => setDetail(j, x)} />
      </div>
    ))
  }

  if (s.type === 'nps') {
    return (
      <>
        <div className="nps">
          {Array.from({ length: 11 }, (_, x) => (
            <button key={x} type="button" className={v === x ? 'on' : ''} onClick={() => setAns('nps', x)}>
              {x}
            </button>
          ))}
        </div>
        <div className="scale" style={{ maxWidth: '100%' }}>
          <span>Not at all likely</span>
          <span>Extremely likely</span>
        </div>
      </>
    )
  }

  return null
}

/* ---------- app ---------- */

export default function App() {
  const [step, setStep] = useState('intro') // 'intro' | 'quiz' | 'end'
  const [i, setI] = useState(0)
  const [ans, setAnsState] = useState({ details: {} })
  const [err, setErr] = useState('')
  const [sending, setSending] = useState(false)
  const [member, setMember] = useState({ first: '', name: '', bd: '', id: '' })

  /* refs mirror state so timers and key handlers always see the latest values */
  const ansRef = useRef(ans)
  const iRef = useRef(i)
  const stepRef = useRef(step)
  const nextRef = useRef(null)
  const bodyRef = useRef(null)
  iRef.current = i
  stepRef.current = step

  const setAns = (k, v) => {
    ansRef.current = { ...ansRef.current, [k]: v }
    setAnsState(ansRef.current)
  }
  const setDetail = (j, x) => {
    ansRef.current = { ...ansRef.current, details: { ...ansRef.current.details, [j]: x } }
    setAnsState(ansRef.current)
  }

  const s = S[i]
  const progress = step === 'end' ? 100 : step === 'intro' ? 0 : (i / S.length) * 100

  /* body classes used by the stylesheet */
  useEffect(() => {
    document.body.classList.toggle('intro', step === 'intro')
  }, [step])

  useEffect(() => {
    const onIn = (e) => {
      if (
        innerWidth <= 820 &&
        /INPUT|TEXTAREA/.test(e.target.tagName) &&
        !['radio', 'checkbox'].includes(e.target.type)
      )
        document.body.classList.add('typing')
    }
    const onOut = () => document.body.classList.remove('typing')
    document.addEventListener('focusin', onIn)
    document.addEventListener('focusout', onOut)
    return () => {
      document.removeEventListener('focusin', onIn)
      document.removeEventListener('focusout', onOut)
    }
  }, [])

  /* scroll + autofocus when the question changes */
  useEffect(() => {
    if (step !== 'quiz') return
    if (i > 0) scrollTo({ top: 0 })
    if (['text', 'tel', 'email'].includes(S[i].type) && innerWidth > 820) {
      const t = setTimeout(() => bodyRef.current?.querySelector('input')?.focus(), 60)
      return () => clearTimeout(t)
    }
  }, [i, step])

  /* keyboard: Enter = continue, letter = pick option */
  useEffect(() => {
    const onKey = (e) => {
      if (stepRef.current !== 'quiz' || e.metaKey || e.ctrlKey) return
      const tag = e.target.tagName
      if (e.key === 'Enter' && tag !== 'TEXTAREA' && tag !== 'BUTTON') {
        e.preventDefault()
        nextRef.current()
        return
      }
      if ((tag === 'INPUT' && e.target.type !== 'radio' && e.target.type !== 'checkbox') || tag === 'TEXTAREA') return
      const n = 'ABCDEFGHIJKLMNOP'.indexOf(e.key.toUpperCase())
      if (e.key.length === 1 && n > -1) {
        const t = bodyRef.current?.querySelectorAll('.o input')[n]
        if (t) t.click()
      }
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  const go = (n) => {
    setI(n)
    setErr('')
  }

  const valid = () => {
    const q = S[iRef.current]
    const v = ansRef.current[q.k]
    if (q.req && (v == null || (Array.isArray(v) && !v.length) || (typeof v === 'string' && !v.trim())))
      return 'Please answer this one to continue.'
    if (q.k === 'email' && v && !/^\S+@\S+\.\S+$/.test(v.trim())) return "That email address doesn't look quite right."
    if (q.k === 'phone' && v.replace(/\D/g, '').length < 7) return 'Please check your phone number.'
    return ''
  }

  const next = () => {
    const m = valid()
    if (m) {
      setErr(m)
      const b = bodyRef.current
      if (b) {
        b.classList.remove('shake')
        void b.offsetWidth
        b.classList.add('shake')
      }
      return
    }
    if (S[iRef.current].last) return submit()
    go(iRef.current + 1)
  }
  nextRef.current = next

  const autoAdvance = () => {
    const n = iRef.current
    setTimeout(() => {
      if (iRef.current === n && stepRef.current === 'quiz') nextRef.current()
    }, 380)
  }

  const start = () => {
    setStep('quiz')
    go(0)
    scrollTo(0, 0)
  }

  const back = () => {
    if (i > 0) go(i - 1)
    else {
      setStep('intro')
      scrollTo(0, 0)
    }
  }

  async function submit() {
    setSending(true)
    const A = ansRef.current
    const fd = new FormData()
    S.forEach((q) => {
      if (q.type === 'multirate') {
        DET.forEach((_, j) => {
          if (A.details[j]) fd.append(ENTRY['d' + j], A.details[j])
        })
        return
      }
      const v = A[q.k]
      if (v == null || v === '') return
      const o = A[q.k + '_o']
      if (q.type === 'date') {
        const [y, m, d] = v.split('-')
        fd.append(ENTRY[q.k] + '_year', y)
        fd.append(ENTRY[q.k] + '_month', +m)
        fd.append(ENTRY[q.k] + '_day', +d)
      } else if (Array.isArray(v)) {
        v.forEach((x) => fd.append(ENTRY[q.k], (x === 'Other' || x === 'Food allergies') && o ? x + ': ' + o : x))
      } else {
        fd.append(ENTRY[q.k], v === 'Other' && o ? 'Other: ' + o : String(v))
      }
    })
    try {
      await fetch(FORM_ACTION, { method: 'POST', mode: 'no-cors', body: fd })
    } catch (e) {
      /* no-cors: errors are expected and ignored, same as the original */
    }
    const name = A.name.trim()
    const [, m, d] = A.birthday.split('-')
    setMember({
      first: name.split(' ')[0],
      name,
      bd: new Date(2000, m - 1, d).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' }),
      id: 'No. ' + (Math.floor(Math.random() * 9000) + 1000),
    })
    setSending(false)
    setStep('end')
    scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isChoice = ['radio', 'check'].includes(s.type)

  return (
    <>
      <SvgDefs />
      <Backdrop />

      <div className="pbar">
        <i style={{ width: progress + '%' }} />
        <svg viewBox="0 0 100 100" style={{ color: '#e8704f', left: progress + '%' }}>
          <use href="#orange" />
        </svg>
      </div>
      <Confetti run={step === 'end'} />

      <div className="shell">
        <aside className="side">
          <img className="lg" src={LOGO} alt="Frootshive" />
          <div className="mhead">
            <div className="mchap">{step === 'end' ? 'Complete' : ROM[s.ch] + ' · ' + CH[s.ch]}</div>
            <div className="mcount">
              {step === 'end' ? (
                '✓'
              ) : (
                <>
                  {pad(i + 1)} <small>/ {pad(S.length)}</small>
                </>
              )}
            </div>
          </div>
          <div className="tag">
            Freshness you can taste,
            <br />
            nature you can trust.
          </div>
          <ul className="chs">
            {CH.map((c, j) => {
              const cls = step === 'end' ? 'done' : step === 'intro' ? '' : j < s.ch ? 'done' : j === s.ch ? 'cur' : ''
              return (
                <li key={c} className={cls}>
                  <i>{ROM[j]}</i>
                  {c}
                </li>
              )
            })}
          </ul>
          <Tri className="tri side-tri" />
        </aside>

        <main className="main">
          <div className="hero">
            <div className="row">
              <img className="lg" src={LOGO} alt="Frootshive" />
              <div className="tg">Freshness you can taste, nature you can trust.</div>
            </div>
            <Tri />
          </div>

          {step === 'intro' && (
            <section id="intro" className="on">
              <div className="eye">
                <svg viewBox="0 0 100 100">
                  <use href="#berry" />
                </svg>
                Customer Experience &amp; Get to Know You
              </div>
              <h1>
                Welcome to the <em>Hive.</em>
              </h1>
              <div className="lead">
                <p>
                  <b>Hey Frootshive family!</b> Thank you for choosing Frootshive.ng and allowing us to be a little part of
                  your healthy lifestyle.
                </p>
                <p>
                  We'd love to hear about your experience: what you loved, what we can improve, and what you'd like to see
                  from us next. We'd also like to know you a little better, so we can celebrate special moments with you,
                  including your birthday.
                </p>
              </div>
              <div className="facts">
                <span>About 3 minutes</span>
                <span>Mostly tap-to-answer</span>
                <span>Bonus questions are optional</span>
              </div>
              <div className="actions">
                <button className="go" onClick={start}>
                  Begin &nbsp;→
                </button>
              </div>
              <div className="hint">Your details are only used to serve you better.</div>
              <div className="cap">Hand-packed baskets &amp; hampers</div>
              <div className="marq">
                <div>
                  {[...PH, ...PH].map((src, idx) => (
                    <img key={idx} src={src} alt="" />
                  ))}
                </div>
              </div>
            </section>
          )}

          {step === 'quiz' && (
            <section key={i} id="quiz" className="on">
              <div className="strip">
                {[3, 0, 6].map((o) => (
                  <div className="sa" key={o}>
                    <img alt="" src={ph(i + o)} />
                  </div>
                ))}
              </div>
              <div className="eye">
                <img className="chimg" alt="" src={ph(s.ch * 2 + 1)} />
                <span>{CH[s.ch]}</span>
                <span className="opt-tag">{s.bonus ? 'Bonus · optional' : s.req ? '' : 'Optional'}</span>
              </div>
              <div className="qn">
                {pad(i + 1)} <small>/ {pad(S.length)}</small>
              </div>
              <h2>{s.t}</h2>
              <p className="sub" style={{ display: s.sub ? 'block' : 'none' }}>
                {s.sub || ''}
              </p>
              <div className="body" ref={bodyRef}>
                <Field
                  s={s}
                  ans={ans}
                  setAns={setAns}
                  setDetail={setDetail}
                  clearErr={() => setErr('')}
                  onAutoAdvance={autoAdvance}
                />
              </div>
              <div className="err">{err}</div>
              <div className="actions">
                <button className="ico" aria-label="Back" onClick={back}>
                  ←
                </button>
                <button className="link" style={{ display: s.req ? 'none' : 'inline-block' }} onClick={() => go(i + 1)}>
                  Skip
                </button>
                <button className="go" disabled={sending} onClick={next}>
                  {sending ? 'Sending…' : s.last ? <>Submit &nbsp;✓</> : <>Continue &nbsp;→</>}
                </button>
              </div>
              <div className="hint" id="kh" style={{ display: isChoice ? 'block' : 'none' }}>
                {isChoice && (
                  <>
                    Tip: press the <b>letter</b> beside an option to select it
                  </>
                )}
              </div>
            </section>
          )}

          {step === 'end' && (
            <section id="end" className="on">
              <div className="eye">
                <svg viewBox="0 0 100 100">
                  <use href="#cherry" />
                </svg>
                Welcome to the Hive
              </div>
              <h1>{'Thank you, ' + member.first + '.'}</h1>
              <div className="lead">
                <p>
                  Your feedback helps us grow fresher and better with every order. You're now officially part of the Hive,
                  and we can't wait to celebrate with you.
                </p>
              </div>
              <div className="gal">
                {PH.slice(0, 6).map((src, idx) => (
                  <img key={idx} src={src} alt="" />
                ))}
              </div>
              <div className="member">
                <div className="top">
                  <small>FROOTSHIVE · HIVE MEMBER</small>
                  <img src={LOGO} alt="" />
                </div>
                <div className="nm">{member.name}</div>
                <div className="row">
                  <div>
                    Birthday<b>{member.bd}</b>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    Member no.<b>{member.id}</b>
                  </div>
                </div>
              </div>
              <div className="soc">
                {Object.entries(SOCIAL)
                  .filter(([, href]) => href)
                  .map(([label, href]) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer">
                      {label}
                    </a>
                  ))}
              </div>
              <p
                style={{
                  fontFamily: "'Cormorant Garamond',serif",
                  fontStyle: 'italic',
                  fontSize: 23,
                  color: 'var(--leaf)',
                  margin: '28px 0 0',
                }}
              >
                Freshness you can taste, nature you can trust.
              </p>
            </section>
          )}
        </main>
      </div>
    </>
  )
}
