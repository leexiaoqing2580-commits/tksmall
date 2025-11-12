
import axios from 'axios'
import useSWR from 'swr'
import { useState, useRef } from 'react'
const fetcher = url => axios.get(url).then(r=>r.data)
export default function Merchants(){
  const [q, setQ] = useState('')
  const { data, mutate } = useSWR('http://localhost:4000/api/admin/merchants?limit=200', fetcher, { fallbackData: { items: [] } })
  const items = data.items || []
  const filtered = items.filter(m => (m.name||'').toLowerCase().includes(q.toLowerCase()) || (m.email||'').toLowerCase().includes(q.toLowerCase()))
  function exportCSV(){
    const rows = [['id','name','email','approved','createdAt']].concat(filtered.map(m=>[m.id,m.name,m.email,m.approved,m.createdAt]))
    const csv = rows.map(r=>r.map(c=>`"${(''+c).replace(/"/g,'""')}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'merchants.csv'; a.click(); URL.revokeObjectURL(url)
  }
  return (
    <div style={{maxWidth:1200,margin:'24px auto',fontFamily:'Arial'}}>
      <h1 style={{fontSize:20,fontWeight:700}}>Merchants</h1>
      <div style={{marginTop:12,display:'flex',gap:8}}>
        <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search name or email" style={{padding:8,flex:1}}/>
        <button onClick={exportCSV} style={{padding:'8px 12px',background:'#0b5fa5',color:'#fff',border:'none'}}>Export CSV</button>
        <button onClick={()=>mutate()} style={{padding:'8px 12px'}}>Refresh</button>
      </div>
      <table style={{width:'100%',borderCollapse:'collapse',marginTop:12}}>
        <thead><tr style={{background:'#f3f4f6'}}><th style={{padding:8}}>ID</th><th> Name </th><th>Email</th><th>Approved</th><th>Created</th><th>Actions</th></tr></thead>
        <tbody>
          {filtered.map(m=> (
            <tr key={m.id} style={{borderBottom:'1px solid #eee'}}>
              <td style={{padding:8}}>{m.id}</td>
              <td><a href={'/admin/merchant/'+m.id} style={{color:'#0b5fa5'}}>{m.name}</a></td>
              <td>{m.email}</td>
              <td>{m.approved? <span style={{background:'#16a34a',color:'#fff',padding:'4px 8px',borderRadius:4}}>Yes</span> : <span style={{background:'#ef4444',color:'#fff',padding:'4px 8px',borderRadius:4}}>No</span>}</td>
              <td>{new Date(m.createdAt).toLocaleString()}</td>
              <td><button onClick={async ()=>{ await axios.post('http://localhost:4000/api/admin/merchant/'+m.id+'/approve'); mutate() }} style={{marginRight:8}}>Approve</button>
              <button onClick={async ()=>{ const reason=prompt('Reject reason'); await axios.post('http://localhost:4000/api/admin/merchant/'+m.id+'/reject',{reason}); mutate() }}>Reject</button></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
