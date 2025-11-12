
import axios from 'axios'
import useSWR from 'swr'
const fetcher = url => axios.get(url).then(r=>r.data)
export default function Orders(){
  const { data } = useSWR('http://localhost:4000/api/admin/orders?limit=50', fetcher, { fallbackData: { items: [] } })
  const items = data.items || []
  return (
    <div style={{maxWidth:1100,margin:'24px auto'}}>
      <h1 style={{fontSize:20,fontWeight:700}}>Orders</h1>
      <table style={{width:'100%',borderCollapse:'collapse',marginTop:12}}>
        <thead><tr style={{background:'#f3f4f6'}}><th style={{padding:8}}>ID</th><th>Product</th><th>Qty</th><th>Total</th><th>Status</th><th>Created</th></tr></thead>
        <tbody>
          {items.map(o=> (
            <tr key={o.id} style={{borderBottom:'1px solid #eee'}}>
              <td style={{padding:8}}>{o.id}</td>
              <td>{o.product?o.product.name:'-'}</td>
              <td>{o.quantity}</td>
              <td>${o.total}</td>
              <td>{o.status}</td>
              <td>{new Date(o.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
