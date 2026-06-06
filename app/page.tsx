'use client'

import { useState } from 'react'

type Screen = 'landing' | 'scan' | 'processing' | 'results'
type Platform = 'vinted' | 'depop' | 'ebay' | 'etsy'

export default function Home() {
  const [screen, setScreen]       = useState<Screen>('landing')
  const [platform, setPlatform]   = useState<Platform>('vinted')
  const [procStep, setProcStep]   = useState(0)
  const [copied, setCopied]       = useState<string | null>(null)
  const [email, setEmail]         = useState('')
  const [joined, setJoined]       = useState(false)

  const goTo = (s: Screen) => {
    setScreen(s)
    if (s === 'processing') runProcessing()
  }

  const runProcessing = () => {
    setProcStep(0)
    const delays = [800, 1600, 2400, 3400]
    delays.forEach((d, i) => setTimeout(() => {
      setProcStep(i + 1)
      if (i === delays.length - 1) setTimeout(() => setScreen('results'), 800)
    }, d))
  }

  const copy = (key: string, text: string) => {
    navigator.clipboard.writeText(text).catch(() => {})
    setCopied(key)
    setTimeout(() => setCopied(null), 2000)
  }

  const listings = {
    vinted: {
      title: 'Nike Air Force 1 Low White Trainers – UK 9',
      description: 'Classic Nike Air Force 1 Lows in the all-white colourway, UK size 9. Condition is Good — there\'s the usual toe box creasing and a touch of sole yellowing you\'d expect, but no scuffs or damage to the upper. Leather feels clean and the sole is solid. Sent within 2 working days, tracked.',
      extra: null,
    },
    depop: {
      title: 'Nike Air Force 1 Low – white/white UK9, good cond',
      description: 'Classic AF1s in the all-white colourway. Usual toe crease and a bit of sole yellowing — nothing unexpected for this shoe. Leather upper is clean, no scuffs. UK 9. Happy to answer any questions 👟',
      extra: ['#nike', '#airforce1', '#af1', '#trainers', '#streetwear'],
    },
    ebay: {
      title: 'Nike Air Force 1 Low Trainers White UK9 AF1 Retro Casual Shoes',
      description: 'Classic Nike Air Force 1 Low trainers in the all-white colourway, UK size 9. Good condition — light creasing on the toe box and minor sole yellowing, but no scuffs or damage to the leather upper. Dispatched within 1–2 working days via Evri tracked. UK buyers only.',
      extra: ['Brand: Nike', 'UK Size: 9', 'Colour: White', 'Style: Low Top', 'Condition: Good'],
    },
    etsy: {
      title: 'Nike Air Force 1 Low Trainers White UK 9 – Good Condition Classic Streetwear Shoes',
      description: 'A classic pair of Nike Air Force 1 Low trainers in the all-white colourway, UK size 9. In Good condition — the typical toe box creasing and a touch of sole yellowing are present, but the leather upper is clean and free of scuffs. Dispatched within 2 working days, tracked and securely packaged.',
      extra: ['nike trainers', 'air force 1', 'white trainers', 'uk size 9', 'streetwear shoes', 'mens trainers', 'casual trainers', 'af1', 'retro trainers', 'low top shoes', 'leather trainers', 'nike shoes', 'sports footwear'],
    },
  }

  const current = listings[platform]

  const procLabels = [
    'Uploading photo…',
    'Removing background…',
    'Enhancing colours…',
    'Writing listings…',
  ]

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;600&family=Syne:wght@700;800&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        :root{
          --teal:#1D9E75;--teal-l:#E1F5EE;--teal-d:#0F6E56;--teal-m:#5DCAA5;
          --bg:#F7F7F5;--white:#fff;--text:#1A1A18;--mid:#5F5E5A;--muted:#888780;
          --border:rgba(0,0,0,0.08);--r:16px;--rs:10px;
        }
        body{font-family:'DM Sans',sans-serif;background:var(--bg);color:var(--text);-webkit-font-smoothing:antialiased}
        button{cursor:pointer;font-family:'DM Sans',sans-serif}
        input{font-family:'DM Sans',sans-serif}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
      `}</style>

      {/* ── LANDING ── */}
      {screen === 'landing' && (
        <div style={{animation:'fadeIn 0.3s ease'}}>
          {/* Nav */}
          <nav style={{background:'var(--white)',borderBottom:'0.5px solid var(--border)',padding:'0 20px',height:56,display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:100}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:22,fontWeight:800}}>listed<span style={{color:'var(--teal)'}}>.</span></div>
            <button onClick={() => goTo('scan')} style={{background:'var(--teal)',color:'white',border:'none',padding:'8px 18px',borderRadius:50,fontSize:14,fontWeight:500}}>Try it free</button>
          </nav>

          {/* Hero */}
          <div style={{background:'var(--white)',padding:'48px 20px 40px',textAlign:'center',borderBottom:'0.5px solid var(--border)'}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:6,background:'var(--teal-l)',color:'var(--teal-d)',fontSize:12,fontWeight:500,padding:'5px 12px',borderRadius:50,marginBottom:20}}>
              <div style={{width:6,height:6,borderRadius:'50%',background:'var(--teal)'}}/>
              Now in early access
            </div>
            <h1 style={{fontFamily:'Syne,sans-serif',fontSize:38,fontWeight:800,lineHeight:1.1,letterSpacing:-0.5,marginBottom:12}}>
              One snap.<br/><span style={{color:'var(--teal)'}}>Four listings.</span>
            </h1>
            <p style={{fontSize:16,color:'var(--mid)',lineHeight:1.5,marginBottom:28,maxWidth:300,margin:'0 auto 28px'}}>
              Take one photo. Listed. writes your Vinted, Depop, eBay, and Etsy listings automatically — studio photo included.
            </p>
            <button onClick={() => goTo('scan')} style={{background:'var(--teal)',color:'white',border:'none',padding:'16px 0',borderRadius:50,fontSize:16,fontWeight:600,width:'100%',maxWidth:280,display:'block',margin:'0 auto 12px'}}>
              Scan your first item →
            </button>
            <p style={{fontSize:12,color:'var(--muted)'}}>Free to try · No account needed</p>
          </div>

          {/* Mini phone mockup */}
          <div style={{padding:'32px 20px',display:'flex',justifyContent:'center',background:'var(--bg)'}}>
            <div style={{width:240,background:'var(--white)',borderRadius:28,border:'0.5px solid var(--border)',overflow:'hidden',boxShadow:'0 12px 40px rgba(0,0,0,0.10)'}}>
              <div style={{background:'var(--teal)',padding:'10px 16px'}}>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:13,fontWeight:800,color:'white'}}>listed<span style={{opacity:0.6}}>.</span></div>
              </div>
              <div style={{padding:14}}>
                {[
                  {emoji:'👟',name:'Nike Air Force 1 Low – White UK9',price:'£38',bg:'var(--teal-l)'},
                  {emoji:'👗',name:'Zara Floral Midi Dress – Size 12',price:'£22',bg:'#FEF3C7'},
                  {emoji:'👜',name:'ASOS Faux Leather Bag – Black',price:'£18',bg:'#EDE9FE'},
                ].map((item,i) => (
                  <div key={i} style={{display:'flex',gap:10,alignItems:'center',padding:10,background:'var(--bg)',borderRadius:12,marginBottom:8}}>
                    <div style={{width:44,height:44,borderRadius:8,background:item.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:20,flexShrink:0}}>{item.emoji}</div>
                    <div style={{flex:1}}>
                      <div style={{fontSize:11,fontWeight:500,lineHeight:1.3}}>{item.name}</div>
                      <div style={{display:'flex',gap:3,marginTop:4,flexWrap:'wrap'}}>
                        {['Vinted','Depop','eBay','Etsy'].map(p => (
                          <span key={p} style={{fontSize:9,padding:'2px 5px',borderRadius:50,fontWeight:500,background:p==='Vinted'?'#009688':p==='Depop'?'#ff2300':p==='eBay'?'#e53238':'#f16521',color:'white'}}>{p}</span>
                        ))}
                      </div>
                    </div>
                    <div style={{fontSize:13,fontWeight:600,color:'var(--teal-d)',flexShrink:0}}>{item.price}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* How it works */}
          <div style={{padding:'40px 20px',background:'var(--white)',borderBottom:'0.5px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:500,textTransform:'uppercase',letterSpacing:1.5,color:'var(--teal)',marginBottom:8}}>How it works</div>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,marginBottom:28}}>Three steps.<br/>Four marketplaces.</h2>
            {[
              {n:1,title:'Snap your item',body:'Take a photo on your phone. Doesn\'t need to be perfect — our AI removes the background and enhances it automatically.'},
              {n:2,title:'We write the listings',body:'Listed. identifies your item and writes SEO-optimised titles and descriptions for every platform, with the right keywords for each one.'},
              {n:3,title:'Copy, post, or auto-publish',body:'One-tap copy for Vinted and Depop. Or hit Post and we publish directly to eBay or Etsy for you.'},
            ].map(s => (
              <div key={s.n} style={{display:'flex',gap:16,marginBottom:24,alignItems:'flex-start'}}>
                <div style={{width:36,height:36,borderRadius:'50%',background:'var(--teal)',color:'white',fontWeight:600,fontSize:14,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{s.n}</div>
                <div>
                  <div style={{fontSize:15,fontWeight:500,marginBottom:4}}>{s.title}</div>
                  <div style={{fontSize:13,color:'var(--mid)',lineHeight:1.5}}>{s.body}</div>
                </div>
              </div>
            ))}
          </div>

          {/* Platforms */}
          <div style={{padding:'40px 20px',background:'var(--bg)',borderBottom:'0.5px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:500,textTransform:'uppercase',letterSpacing:1.5,color:'var(--teal)',marginBottom:8}}>Platforms</div>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,marginBottom:20}}>Every major<br/>secondhand marketplace</h2>
            <div style={{display:'grid',gridTemplateColumns:'repeat(2,minmax(0,1fr))',gap:10}}>
              {[
                {icon:'🟢',name:'Vinted',users:'75M+ members'},
                {icon:'🔴',name:'Depop',users:'35M+ users'},
                {icon:'🔵',name:'eBay UK',users:'30M+ UK buyers'},
                {icon:'🟠',name:'Etsy',users:'90M+ buyers'},
              ].map(p => (
                <div key={p.name} style={{background:'var(--white)',borderRadius:14,border:'0.5px solid var(--border)',padding:16,textAlign:'center'}}>
                  <div style={{fontSize:24,marginBottom:8}}>{p.icon}</div>
                  <div style={{fontSize:13,fontWeight:500,marginBottom:4}}>{p.name}</div>
                  <div style={{fontSize:11,color:'var(--muted)'}}>{p.users}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Pricing */}
          <div style={{padding:'40px 20px',background:'var(--white)',borderBottom:'0.5px solid var(--border)'}}>
            <div style={{fontSize:11,fontWeight:500,textTransform:'uppercase',letterSpacing:1.5,color:'var(--teal)',marginBottom:8}}>Pricing</div>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,marginBottom:24}}>Simple.<br/>No surprises.</h2>
            {[
              {name:'Free',price:'£0',per:'/month',features:['5 listings per month','All 4 platforms','Studio photo enhancement','One-tap copy'],featured:false},
              {name:'Pro',price:'£7.99',per:'/month',features:['Unlimited listings','Auto-post to eBay + Etsy','Bulk scan (up to 5 photos)','Price recommendations','SEO score per listing'],featured:true},
            ].map(plan => (
              <div key={plan.name} style={{border:plan.featured?'1.5px solid var(--teal)':'0.5px solid var(--border)',borderRadius:'var(--r)',overflow:'hidden',marginBottom:12}}>
                <div style={{background:plan.featured?'var(--teal)':'var(--bg)',padding:16,borderBottom:'0.5px solid var(--border)'}}>
                  <div style={{fontSize:13,fontWeight:500,color:plan.featured?'rgba(255,255,255,0.8)':'var(--mid)',marginBottom:4}}>{plan.name}</div>
                  <div style={{fontFamily:'Syne,sans-serif',fontSize:28,fontWeight:800,color:plan.featured?'white':'var(--text)'}}>
                    {plan.price} <span style={{fontFamily:'DM Sans,sans-serif',fontSize:14,fontWeight:400,color:plan.featured?'rgba(255,255,255,0.7)':'var(--muted)'}}>{plan.per}</span>
                  </div>
                </div>
                <div style={{padding:16}}>
                  {plan.features.map(f => (
                    <div key={f} style={{display:'flex',alignItems:'center',gap:10,fontSize:13,color:'var(--mid)',marginBottom:10}}>
                      <span style={{color:'var(--teal)',fontSize:16}}>✓</span> {f}
                    </div>
                  ))}
                  <button onClick={() => goTo('scan')} style={{width:'100%',padding:12,borderRadius:'var(--rs)',border:plan.featured?'none':'1.5px solid var(--teal)',background:plan.featured?'var(--teal)':'transparent',color:plan.featured?'white':'var(--teal)',fontSize:14,fontWeight:500,marginTop:4}}>
                    {plan.featured ? 'Start free trial →' : 'Get started free'}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Waitlist */}
          <div style={{padding:'40px 20px',background:'var(--teal)',textAlign:'center'}}>
            <h2 style={{fontFamily:'Syne,sans-serif',fontSize:24,fontWeight:800,color:'white',marginBottom:8}}>Get early access</h2>
            <p style={{fontSize:14,color:'rgba(255,255,255,0.8)',marginBottom:20}}>Join the waitlist. First 500 get Pro free for 3 months.</p>
            {joined ? (
              <div style={{fontSize:16,fontWeight:500,color:'white'}}>✓ You're on the list</div>
            ) : (
              <div style={{display:'flex',flexDirection:'column',gap:10,maxWidth:300,margin:'0 auto'}}>
                <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com"
                  style={{padding:'14px 16px',borderRadius:10,border:'none',fontSize:14,background:'white',color:'var(--text)'}}/>
                <button onClick={() => email && setJoined(true)}
                  style={{padding:14,background:'var(--teal-d)',color:'white',border:'none',borderRadius:10,fontSize:14,fontWeight:600}}>
                  Join the waitlist
                </button>
              </div>
            )}
          </div>

          <footer style={{background:'var(--text)',padding:'32px 20px',textAlign:'center'}}>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:20,fontWeight:800,color:'white',marginBottom:8}}>listed<span style={{color:'var(--teal-m)'}}>.</span></div>
            <div style={{fontSize:12,color:'rgba(255,255,255,0.4)'}}>One snap. Four listings. © 2026 Listed.</div>
          </footer>
        </div>
      )}

      {/* ── SCAN ── */}
      {screen === 'scan' && (
        <div style={{animation:'fadeIn 0.2s ease',minHeight:'100vh',background:'var(--bg)'}}>
          <div style={{background:'var(--white)',borderBottom:'0.5px solid var(--border)',padding:'0 20px',height:56,display:'flex',alignItems:'center',gap:12,position:'sticky',top:0,zIndex:100}}>
            <button onClick={() => setScreen('landing')} style={{background:'var(--bg)',border:'none',width:36,height:36,borderRadius:'50%',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:800}}>Scan an item</div>
          </div>

          <div onClick={() => goTo('processing')} style={{margin:20,border:'2px dashed var(--teal-m)',borderRadius:'var(--r)',padding:'40px 20px',textAlign:'center',background:'var(--teal-l)',cursor:'pointer'}}>
            <div style={{fontSize:40,marginBottom:12}}>📷</div>
            <div style={{fontSize:16,fontWeight:500,color:'var(--teal-d)',marginBottom:6}}>Take a photo</div>
            <div style={{fontSize:13,color:'var(--teal)'}}>Tap to use your camera</div>
          </div>

          <div style={{display:'flex',alignItems:'center',gap:12,padding:'0 20px',marginBottom:16}}>
            <div style={{flex:1,height:'0.5px',background:'var(--border)'}}/>
            <div style={{fontSize:12,color:'var(--muted)'}}>or try a demo item</div>
            <div style={{flex:1,height:'0.5px',background:'var(--border)'}}/>
          </div>

          {[
            {emoji:'👟',bg:'var(--teal-l)',name:'Nike Air Force 1',sub:'Try with a demo photo'},
            {emoji:'👗',bg:'#FEF3C7',name:'Zara Midi Dress',sub:'Try with a demo photo'},
            {emoji:'👜',bg:'#EDE9FE',name:'ASOS Leather Bag',sub:'Try with a demo photo'},
          ].map((item,i) => (
            <button key={i} onClick={() => goTo('processing')}
              style={{display:'flex',alignItems:'center',gap:12,margin:'0 20px 10px',padding:14,background:'var(--white)',border:'0.5px solid var(--border)',borderRadius:'var(--rs)',width:'calc(100% - 40px)',textAlign:'left'}}>
              <div style={{width:48,height:48,borderRadius:8,background:item.bg,display:'flex',alignItems:'center',justifyContent:'center',fontSize:24,flexShrink:0}}>{item.emoji}</div>
              <div>
                <div style={{fontSize:13,fontWeight:500}}>{item.name}</div>
                <div style={{fontSize:11,color:'var(--muted)',marginTop:2}}>{item.sub}</div>
              </div>
              <div style={{marginLeft:'auto',color:'var(--muted)',fontSize:18}}>→</div>
            </button>
          ))}
        </div>
      )}

      {/* ── PROCESSING ── */}
      {screen === 'processing' && (
        <div style={{animation:'fadeIn 0.2s ease',minHeight:'100vh',background:'var(--bg)'}}>
          <div style={{background:'var(--white)',borderBottom:'0.5px solid var(--border)',padding:'0 20px',height:56,display:'flex',alignItems:'center',gap:12}}>
            <button onClick={() => setScreen('scan')} style={{background:'var(--bg)',border:'none',width:36,height:36,borderRadius:'50%',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:800}}>{procLabels[Math.min(procStep,procLabels.length-1)]}</div>
          </div>
          <div style={{padding:'20px 20px 0'}}>
            <div style={{background:'var(--white)',border:'0.5px solid var(--border)',borderRadius:'var(--r)',aspectRatio:'1',display:'flex',alignItems:'center',justifyContent:'center',position:'relative',marginBottom:20,overflow:'hidden'}}>
              <div style={{fontSize:64,opacity:0.2}}>👟</div>
              <div style={{position:'absolute',inset:0,background:'rgba(255,255,255,0.92)',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:12}}>
                <div style={{width:40,height:40,border:'3px solid var(--teal-l)',borderTopColor:'var(--teal)',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}/>
                <div style={{fontSize:14,fontWeight:500}}>{procLabels[Math.min(procStep,procLabels.length-1)]}</div>
                <div style={{width:160,height:3,background:'var(--teal-l)',borderRadius:50,overflow:'hidden'}}>
                  <div style={{height:'100%',background:'var(--teal)',borderRadius:50,width:`${Math.min(procStep * 28 + 10, 95)}%`,transition:'width 0.6s ease'}}/>
                </div>
                <div style={{fontSize:12,color:'var(--muted)'}}>Studio photo in progress</div>
              </div>
            </div>
            {['Photo uploaded','Removing background','Enhancing colours','Writing listings'].map((label,i) => (
              <div key={i} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 16px',borderRadius:10,fontSize:13,marginBottom:4,
                background: procStep > i ? 'var(--teal-l)' : procStep === i ? 'var(--bg)' : 'transparent',
                color: procStep > i ? 'var(--teal-d)' : procStep === i ? 'var(--text)' : 'var(--muted)',
                fontWeight: procStep === i ? 500 : 400,
              }}>
                <div style={{width:8,height:8,borderRadius:'50%',flexShrink:0,
                  background: procStep > i ? 'var(--teal)' : procStep === i ? 'var(--teal)' : 'var(--border)',
                  animation: procStep === i ? 'pulse 1s ease infinite' : 'none',
                }}/>
                {label}
                {procStep > i && <span style={{marginLeft:'auto'}}>✓</span>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── RESULTS ── */}
      {screen === 'results' && (
        <div style={{animation:'fadeIn 0.3s ease',minHeight:'100vh',background:'var(--bg)',paddingBottom:40}}>
          <div style={{background:'var(--white)',borderBottom:'0.5px solid var(--border)',padding:'0 20px',height:56,display:'flex',alignItems:'center',gap:12,position:'sticky',top:0,zIndex:100}}>
            <button onClick={() => setScreen('scan')} style={{background:'var(--bg)',border:'none',width:36,height:36,borderRadius:'50%',fontSize:18,display:'flex',alignItems:'center',justifyContent:'center'}}>←</button>
            <div style={{fontFamily:'Syne,sans-serif',fontSize:18,fontWeight:800}}>Nike Air Force 1</div>
          </div>

          {/* Before/after */}
          <div style={{background:'var(--white)',borderBottom:'0.5px solid var(--border)',padding:16}}>
            <div style={{display:'flex',gap:8}}>
              {[{label:'Original',studio:false,bg:'var(--bg)'},{label:'Studio',studio:true,bg:'white'}].map(p => (
                <div key={p.label} style={{flex:1,aspectRatio:'1',borderRadius:12,background:p.bg,border:'0.5px solid var(--border)',display:'flex',alignItems:'center',justifyContent:'center',position:'relative'}}>
                  <div style={{fontSize:40}}>👟</div>
                  <div style={{position:'absolute',bottom:6,left:6,fontSize:9,fontWeight:500,padding:'2px 7px',borderRadius:50,background:p.studio?'var(--teal)':'rgba(0,0,0,0.5)',color:'white'}}>{p.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Price stats */}
          <div style={{background:'var(--white)',borderBottom:'0.5px solid var(--border)',padding:16,display:'flex',gap:10}}>
            {[{label:'Fast sale',val:'£38',green:true},{label:'Max price',val:'£55',green:false},{label:'Condition',val:'Good',green:false}].map(s => (
              <div key={s.label} style={{flex:1,background:'var(--bg)',borderRadius:10,padding:12,textAlign:'center'}}>
                <div style={{fontSize:10,color:'var(--muted)',marginBottom:4,textTransform:'uppercase',letterSpacing:0.5}}>{s.label}</div>
                <div style={{fontFamily:'Syne,sans-serif',fontSize:s.label==='Condition'?14:20,fontWeight:800,color:s.green?'var(--teal-d)':'var(--text)',paddingTop:s.label==='Condition'?4:0}}>{s.val}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <div style={{background:'var(--white)',borderBottom:'0.5px solid var(--border)',display:'flex',padding:'0 20px',overflowX:'auto'}}>
            {(['vinted','depop','ebay','etsy'] as Platform[]).map(p => (
              <button key={p} onClick={() => setPlatform(p)}
                style={{flexShrink:0,padding:'12px 16px',fontSize:13,fontWeight:500,background:'none',border:'none',borderBottom:platform===p?'2px solid var(--teal)':'2px solid transparent',color:platform===p?'var(--teal-d)':'var(--muted)',cursor:'pointer',whiteSpace:'nowrap',textTransform:'capitalize'}}>
                {p === 'ebay' ? 'eBay UK' : p.charAt(0).toUpperCase() + p.slice(1)}
              </button>
            ))}
          </div>

          {/* Listing card */}
          <div style={{margin:16,background:'var(--white)',borderRadius:'var(--r)',border:'0.5px solid var(--border)',overflow:'hidden'}}>
            {/* Title */}
            <div style={{padding:'14px 16px',borderBottom:'0.5px solid var(--border)'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:0.8,color:'var(--muted)',fontWeight:500}}>
                  Title {platform==='ebay' && <span style={{color:'var(--teal)',marginLeft:6}}>58/80 chars</span>}
                </div>
                <button onClick={() => copy('title',current.title)}
                  style={{background:'var(--teal-l)',border:'none',color:'var(--teal-d)',fontSize:11,fontWeight:500,padding:'3px 10px',borderRadius:50}}>
                  {copied==='title'?'Copied!':'Copy'}
                </button>
              </div>
              <div style={{fontSize:14,fontWeight:500,lineHeight:1.4}}>{current.title}</div>
            </div>

            {/* Description */}
            <div style={{padding:'14px 16px',borderBottom:current.extra?'0.5px solid var(--border)':'none'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:6}}>
                <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:0.8,color:'var(--muted)',fontWeight:500}}>Description</div>
                <button onClick={() => copy('desc',current.description)}
                  style={{background:'var(--teal-l)',border:'none',color:'var(--teal-d)',fontSize:11,fontWeight:500,padding:'3px 10px',borderRadius:50}}>
                  {copied==='desc'?'Copied!':'Copy'}
                </button>
              </div>
              <div style={{fontSize:13,color:'var(--text)',lineHeight:1.6}}>{current.description}</div>
            </div>

            {/* Extras: hashtags / item specifics / tags */}
            {current.extra && (
              <div style={{padding:'14px 16px'}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                  <div style={{fontSize:10,textTransform:'uppercase',letterSpacing:0.8,color:'var(--muted)',fontWeight:500}}>
                    {platform==='depop'?'Hashtags':platform==='ebay'?'Item specifics':'Tags (13)'}
                  </div>
                  <button onClick={() => copy('extra',(current.extra as string[]).join(' '))}
                    style={{background:'var(--teal-l)',border:'none',color:'var(--teal-d)',fontSize:11,fontWeight:500,padding:'3px 10px',borderRadius:50}}>
                    {copied==='extra'?'Copied!':'Copy'}
                  </button>
                </div>
                <div style={{display:'flex',flexWrap:'wrap',gap:6}}>
                  {(current.extra as string[]).map((tag:string) => (
                    <span key={tag} style={{fontSize:11,padding:'3px 10px',borderRadius:50,fontWeight:500,background:'var(--teal-l)',color:'var(--teal-d)',border:'0.5px solid rgba(29,158,117,0.2)'}}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Post button */}
          <button style={{margin:'0 16px',width:'calc(100% - 32px)',padding:14,background:platform==='etsy'?'#f16521':platform==='depop'?'#ff2300':'var(--teal)',color:'white',border:'none',borderRadius:'var(--rs)',fontSize:15,fontWeight:600}}>
            {platform==='vinted'||platform==='depop'?`Copy all for ${platform.charAt(0).toUpperCase()+platform.slice(1)} →`:`Post to ${platform==='ebay'?'eBay UK':'Etsy'} now →`}
          </button>
        </div>
      )}
    </>
  )
}
