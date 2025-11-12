
const express = require('express'), cors = require('cors'), bodyParser = require('body-parser')
require('dotenv').config()
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const { v4: uuidv4 } = require('uuid')
const app = express()
app.use(cors()); app.use(bodyParser.json())

app.get('/api/health',(req,res)=>res.json({status:'ok'}))

app.get('/api/products', async (req,res)=>{
  const page = parseInt(req.query.page||'1'); const limit = parseInt(req.query.limit||'24'); const skip = (page-1)*limit
  const q = req.query.q || ''
  const where = q ? { where: { name: { contains: q } } } : {}
  try{
    const total = await prisma.product.count(q?{where:{name:{contains:q}}}:{ })
    const items = await prisma.product.findMany({ skip, take: limit, orderBy:{ createdAt:'desc' }, ...(q?{where:{name:{contains:q}}}:{}) })
    res.json({ total, page, limit, items })
  }catch(e){ console.error(e); res.status(500).json({error:'db_error'}) }
})

app.get('/api/products/:id', async (req,res)=>{
  try{ const p = await prisma.product.findUnique({ where:{ id: req.params.id } }); if(!p) return res.status(404).json({error:'not_found'}); res.json(p) }catch(e){ console.error(e); res.status(500).json({error:'db_error'}) }
})

app.post('/api/products', async (req,res)=>{
  const { name, description, price, stock, image, merchantId } = req.body
  if(!name || !price) return res.status(400).json({ error:'missing' })
  try{ const p = await prisma.product.create({ data: { name, description, price: parseFloat(price), stock: parseInt(stock||'0'), image: image||'', merchantId } }); res.status(201).json(p) }catch(e){ console.error(e); res.status(500).json({error:'db_error'}) }
})

app.post('/api/merchant/register', async (req,res)=>{
  const { name, email } = req.body; if(!name||!email) return res.status(400).json({ error:'missing' })
  try{ const m = await prisma.merchant.create({ data:{ name, email } }); res.status(201).json(m) }catch(e){ console.error(e); res.status(500).json({error:'db_error'}) }
})

// Fake payment create
app.post('/api/pay/create', async (req,res)=>{
  const { userId, productId, quantity, method } = req.body; if(!userId||!productId||!method) return res.status(400).json({ error:'missing' })
  try{
    const product = await prisma.product.findUnique({ where:{ id: productId } })
    if(!product) return res.status(404).json({ error:'not_found' })
    const total = parseFloat((product.price * (quantity||1)).toFixed(2))
    const tx = uuidv4().replace(/-/g,'')
    const order = await prisma.order.create({ data:{ userId, productId, quantity: quantity||1, total, status:'pending', paymentTx: tx } })
    const addr = method === 'BTC' ? 'bitcoin:mockaddress' : 'erc20:mockaddress'
    res.json({ order, payment: { method, amount: total, address: addr, tx } })
  }catch(e){ console.error(e); res.status(500).json({ error:'db_error' }) }
})

// Confirm payment (simulate webhook)
app.post('/api/pay/confirm', async (req,res)=>{
  const { orderId, tx } = req.body; if(!orderId) return res.status(400).json({ error:'missing' })
  try{ const o = await prisma.order.update({ where:{ id: orderId }, data:{ status:'paid', paymentTx: tx||null } }); res.json({ ok:true, order: o }) }catch(e){ console.error(e); res.status(500).json({ error:'db_error' }) }
})

app.get('/api/admin/stats', async (req,res)=>{
  const users = await prisma.user.count(); const products = await prisma.product.count(); const orders = await prisma.order.count()
  res.json({ users, products, orders })
})



// Simple admin auth (demo only)
const ADMIN_TOKEN_STORE = {}
app.post('/api/admin/login', async (req,res)=>{
  const { email, pw } = req.body
  // Demo credentials: admin@tks.com / Admin123!
  if(email === 'admin@tks.com' && pw === 'Admin123!'){
    const token = uuidv4().replace(/-/g,'')
    ADMIN_TOKEN_STORE[token] = { email, createdAt: new Date().toISOString() }
    return res.json({ token })
  }
  res.status(401).json({ error: 'invalid' })
})

// middleware
function requireAdmin(req,res,next){
  const auth = req.headers['x-admin-token'] || req.query.adminToken || req.body.adminToken
  if(!auth || !ADMIN_TOKEN_STORE[auth]) return res.status(401).json({ error: 'unauthorized' })
  next()
}

const PORT = process.env.PORT || 4000


// Merchant batch actions: bulk update status (simple demo)
app.post('/api/merchant/:mid/products/bulk', async (req,res)=>{
  const { action, ids } = req.body // action: 'delete'|'publish' etc
  if(!ids || !Array.isArray(ids)) return res.status(400).json({ error:'missing' })
  try{
    if(action === 'delete'){
      await prisma.product.deleteMany({ where: { id: { in: ids } } })
    }else if(action === 'publish'){
      // in demo we don't have publish flag; just return ok
    }
    res.json({ ok: true })
  }catch(e){ console.error(e); res.status(500).json({ error:'db_error' }) }
})

// Refund endpoint (simulate)
app.post('/api/admin/order/:id/refund', requireAdmin, async (req,res)=>{
  const id = req.params.id; try{
    const o = await prisma.order.update({ where: { id }, data: { status: 'refunded' } })
    res.json({ ok:true, order: o })
  }catch(e){ console.error(e); res.status(500).json({ error:'db_error' }) }
})

// Wallet endpoints (simulate deposit/withdraw for merchant)
app.post('/api/admin/merchant/:id/deposit', requireAdmin, async (req,res)=>{
  const id = req.params.id; const amount = parseFloat(req.body.amount||0)
  // For demo we do not persist balances; respond OK
  res.json({ ok:true, merchantId: id, deposited: amount })
})

app.post('/api/admin/merchant/:id/withdraw', requireAdmin, async (req,res)=>{
  const id = req.params.id; const amount = parseFloat(req.body.amount||0)
  res.json({ ok:true, merchantId: id, withdrawn: amount })
})

app.listen(PORT, ()=> console.log('Backend listening on', PORT))



// Admin: list merchants with pagination and filters
app.get('/api/admin/merchants', requireAdmin, async (req,res)=>{
  try{
    const page = parseInt(req.query.page||'1'); const limit = parseInt(req.query.limit||'50'); const skip=(page-1)*limit;
    const where = {}
    const total = await prisma.merchant.count({ where })
    const items = await prisma.merchant.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } })
    res.json({ total, page, limit, items })
  }catch(e){ console.error(e); res.status(500).json({ error:'db_error' }) }
})

// Admin: get orders (with merchant filter)
app.get('/api/admin/orders', requireAdmin, async (req,res)=>{
  try{
    const page = parseInt(req.query.page||'1'); const limit = parseInt(req.query.limit||'50'); const skip=(page-1)*limit;
    const merchantId = req.query.merchantId
    const where = merchantId ? { where: { product: { merchantId } } } : {}
    const total = await prisma.order.count(where.where?{ where: { product: { merchantId } } }:{ })
    const items = await prisma.order.findMany({ skip, take: limit, orderBy: { createdAt: 'desc' } , include: { product: true } , ...(merchantId?{ where: { product: { merchantId } } }:{}) })
    res.json({ total, page, limit, items })
  }catch(e){ console.error(e); res.status(500).json({ error:'db_error' }) }
})

// Admin: approve merchant
app.post('/api/admin/merchant/:id/approve', requireAdmin, async (req,res)=>{
  try{
    const id = req.params.id
    const m = await prisma.merchant.update({ where: { id }, data: { approved: true } })
    res.json(m)
  }catch(e){ console.error(e); res.status(500).json({ error:'db_error' }) }
})

// Admin: reject merchant with reason
app.post('/api/admin/merchant/:id/reject', requireAdmin, async (req,res)=>{
  try{
    const id = req.params.id
    const reason = req.body.reason || ''
    const m = await prisma.merchant.update({ where: { id }, data: { approved: false } })
    // For demo, we don't store reason but in prod you would
    res.json({ ok: true, merchant: m, reason })
  }catch(e){ console.error(e); res.status(500).json({ error:'db_error' }) }
})
