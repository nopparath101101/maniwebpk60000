// Vercel Serverless Function: สร้าง js/content.js สดจาก Supabase (ใช้เมื่อโฮสต์เว็บบน Vercel)
// vercel.json จะเปลี่ยนเส้นทาง /js/content.js มาที่ /api/content
// บน Windows Server 2008 / IIS ไม่ใช้ไฟล์นี้ (ใช้ sync\sync.vbs แทน)
//
// ค่าตั้งต้นใช้ Project URL และ publishable key ของโปรเจกต์นี้ (เปิดเผยได้ เพราะ Supabase จำกัดสิทธิ์อ่านเฉพาะข้อมูลที่เผยแพร่แล้ว)
// ถ้าต้องการเปลี่ยน ให้ตั้ง Environment Variables ใน Vercel: SUPABASE_URL และ SUPABASE_KEY

var SUPABASE_URL = process.env.SUPABASE_URL || 'https://vikmdgfaouubhnekcetn.supabase.co';
var SUPABASE_KEY = process.env.SUPABASE_KEY || 'sb_publishable_qM_NWXhMBecTYs-kRpK87g__oZl6sdu';

// ถ้าดึงข้อมูลไม่ได้ ให้ส่งค่าว่างกลับไป เพื่อไม่ให้หน้าเว็บพังทั้งหน้า
var EMPTY = '/* ดึงข้อมูลจาก Supabase ไม่สำเร็จ */\n' +
  'var DEPTS = [];\nvar NEWS = [];\nvar CIRCULARS = [];\nvar HUB = [];\nvar PHONES = [];\nvar DASHBOARDS = [];\n';

module.exports = async function handler(req, res) {
  res.setHeader('Content-Type', 'application/javascript; charset=utf-8');
  try {
    var r = await fetch(SUPABASE_URL + '/rest/v1/rpc/site_content_js', {
      headers: { apikey: SUPABASE_KEY, Accept: 'application/json' }
    });
    if (!r.ok) { throw new Error('HTTP ' + r.status); }
    var text = await r.json();                       // PostgREST ส่งข้อความกลับมาเป็นสตริง JSON
    if (typeof text !== 'string' || text.indexOf('var NEWS') === -1 || text.indexOf('var CIRCULARS') === -1) {
      throw new Error('unexpected payload');
    }
    // CDN ของ Vercel เก็บไว้ 5 นาที จึงไม่เรียก Supabase ทุกครั้งที่มีผู้เข้าชม
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=30, stale-while-revalidate=30');
    res.status(200).send(text);
  } catch (e) {
    res.setHeader('Cache-Control', 'no-store');
    res.status(200).send(EMPTY + '/* ' + String(e && e.message).replace(/\*\//g, '') + ' */\n');
  }
};
