
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
async function main(){
  const merchant = await prisma.merchant.upsert({ where:{ email:'merchant@tks.com'}, update:{}, create:{ name:'TKS Official', email:'merchant@tks.com', approved:true } })
  const items = []
  for(let i=1;i<=2000;i++){ items.push({ name:`Sample Product ${i}`, description:`Description for product ${i}`, price: parseFloat((Math.random()*200+1).toFixed(2)), stock: Math.floor(Math.random()*500), image:`https://picsum.photos/seed/p${i}/400/300`, merchantId: merchant.id }) }
  for(let i=0;i<items.length;i+=200){ const batch = items.slice(i,i+200); await prisma.product.createMany({ data: batch }) ; console.log('Inserted', Math.min(i+200, items.length)) }
  console.log('Seeding done') 
}
main().catch(e=>{ console.error(e); process.exit(1) }).finally(()=>prisma.$disconnect())
