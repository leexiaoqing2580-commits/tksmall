
import axios from 'axios'; import useSWR from 'swr'
const fetcher = url => axios.get(url).then(r=>r.data)
export default function Manage(){ const { data } = useSWR('http://localhost:4000/api/products?limit=100', fetcher, { fallbackData: { items: [] } })
const products = data.items || []
async function bulkDelete(){ const ids = products.slice(0,5).map(p=>p.id); await axios.post('http://localhost:4000/api/merchant/merchantId/products/bulk',{ action:'delete', ids }) ; alert('Deleted 5 (demo)') }
return (<div style={{maxWidth:1100,margin:'24px auto'}}><h2>Store Products</h2><button onClick={bulkDelete}>Bulk Delete (demo)</button><div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:12,marginTop:12}}>{products.map(p=>(<div key={p.id}><img src={p.image} style={{height:100}}/><div>{p.name}</div><div>${p.price}</div></div>))}</div></div>) }
