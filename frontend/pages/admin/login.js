
import { useState } from 'react'
import axios from 'axios'
export default function AdminLogin(){
  const [email,setEmail]=useState('admin@tks.com'), [pw,setPw]=useState('Admin123!')
  async function submit(e){ e.preventDefault(); try{ const r = await axios.post('http://localhost:4000/api/admin/login',{email,pw}); if(r.data.token){ localStorage.setItem('tks_admin_token', r.data.token); location.href='/admin' } }catch(err){ alert('Login failed') } }
  return (<div style={{maxWidth:400,margin:'120px auto',fontFamily:'Arial'}}><h2>Admin Login</h2><form onSubmit={submit}><input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:8,marginBottom:8}}/><input value={pw} onChange={e=>setPw(e.target.value)} type="password" style={{width:'100%',padding:8,marginBottom:8}}/><button style={{padding:8,background:'#0b5fa5',color:'#fff'}}>Login</button></form></div>)
}
