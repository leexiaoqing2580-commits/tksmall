
import axios from 'axios'
import useSWR from 'swr'
import { useRouter } from 'next/router'
const fetcher = url => axios.get(url).then(r=>r.data)
export default function MerchantDetail(){
  const router = useRouter(); const { id } = router.query
  const { data: m } = useSWR(id?`http://localhost:4000/api/merchant/${id}`:null, fetcher)
  const { data: orders } = useSWR(id?`http://localhost:4000/api/admin/orders?merchantId=${id}&limit=50`:null, fetcher, { fallbackData: { items: [] } })
  const { data: products } = useSWR(id?`http://localhost:4000/api/merchant/${id}/products`:null, fetcher, { fallbackData: [] })
  if(!m) return <div style={{maxWidth:1100,margin:'24px auto'}}>Loading...</div>
  return (
    <div style={{maxWidth:1200,margin:'24px auto',fontFamily:'Arial'}}>
      <h1 style={{fontSize:20,fontWeight:700}}>Merchant: {m.name}</h1>
      <div style={{display:'flex',gap:12,marginTop:12}}>
        <div style={{flex:1}}>
          <h3>Info</h3>
          <div>Email: {m.email}</div>
          <div>Approved: {m.approved? 'Yes':'No'}</div>
          <div>Created: {new Date(m.createdAt).toLocaleString()}</div>
        </div>
        <div style={{width:360}}>
          <h3>Wallet (simulated)</h3>
          <div>Balance: $0.00</div>
          <div style={{marginTop:8}}><button onClick={async ()=>{ await axios.post('http://localhost:4000/api/admin/merchant/'+id+'/deposit',{amount:1000}); alert('Deposited $1000'); }}>Deposit $1000</button></div>
        </div>
      </div>

      <h3 style={{marginTop:20}}>Products</h3>
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12}}>
        {products.map(p=> (<div key={p.id} style={{border:'1px solid #eee',padding:8}}><img src={p.image} style={{height:100,objectFit:'cover'}}/><div style={{fontSize:13}}>{p.name}</div><div style={{color:'#d49a2a'}}>${p.price}</div></div>))}
      </div>

      <h3 style={{marginTop:20}}>Recent Orders</h3>
      <table style={{width:'100%',borderCollapse:'collapse',marginTop:8}}>
        <thead><tr style={{background:'#f3f4f6'}}><th style={{padding:8}}>Order</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th></tr></thead>
        <tbody>
          {orders.items && orders.items.map(o=> (<tr key={o.id} style={{borderBottom:'1px solid #eee'}}><td style={{padding:8}}>{o.id}</td><td>{o.product?o.product.name:'-'}</td><td>{o.quantity}</td><td>${o.total}</td><td>{o.status}</td></tr>))}
        </tbody>
      </table>
    </div>
  )
}
