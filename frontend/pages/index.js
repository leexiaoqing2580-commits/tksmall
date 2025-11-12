
import axios from 'axios'
import useSWR from 'swr'
const fetcher = url => axios.get(url).then(r=>r.data)
export default function Home(){
  const { data } = useSWR('http://localhost:4000/api/products?limit=12', fetcher, { fallbackData: { items: [] } })
  const products = data.items || []
  return (
    <div style={{fontFamily:'Arial'}}>
      <header style={{padding:20,borderBottom:'1px solid #eee'}}>
        <div style={{maxWidth:1100,margin:'0 auto',display:'flex',justifyContent:'space-between'}}>
          <div style={{fontWeight:700,color:'#0b5fa5'}}>TKS-MALL</div>
          <div><input placeholder="Search" style={{padding:8,width:360}}/> <button style={{padding:8,background:'#0b5fa5',color:'#fff'}}>Search</button></div>
        </div>
      </header>
      <main style={{maxWidth:1100,margin:'24px auto'}}>
        <section style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:16}}>
          <div style={{background:'#f9fafb',padding:24}}>
            <h2 style={{color:'#0b5fa5'}}>Wooden Buckle Dress Belts</h2>
            <p>Special price <span style={{background:'#d49a2a',padding:'4px 8px',color:'#fff'}}>$20.70</span></p>
          </div>
          <div style={{display:'flex',flexDirection:'column',gap:12}}><div style={{background:'#fff',padding:12}}>Ad1</div><div style={{background:'#fff',padding:12}}>Ad2</div></div>
        </section>

        <h3 style={{marginTop:24}}>Daily Deals</h3>
        <div style={{display:'grid',gridTemplateColumns:'repeat(6,1fr)',gap:12}}>
          {products.map(p=> (
            <div key={p.id} style={{border:'1px solid #eee',padding:8}}>
              <img src={p.image} style={{height:100,display:'block',margin:'0 auto'}}/>
              <div style={{color:'#d49a2a',fontWeight:700}}>${p.price}</div>
              <div style={{fontSize:12}}>{p.name}</div>
              <button style={{marginTop:8,padding:'6px 8px'}}>Purchase Now</button>
            </div>
          ))}
        </div>
      </main>
    </div>
  )
}
