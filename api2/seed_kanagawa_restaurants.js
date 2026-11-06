const pool = require('./db');

const kanagawaRestaurants = [
  {
    name: 'ร้าน Katsuretsu An (สาขาหลัก Bashamichi)',
    province: 'คานางาวะ',
    starting_price: 1870,
    open_time: '11:00:00',
    close_time: '21:00:00',
    latitude: 35.4472,
    longitude: 139.6350,
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
    description: 'ร้านทงคัตสึระดับตำนานแห่งเมืองโยโกฮาม่า จังหวัดคานางาวะ ก่อตั้งเมื่อปี 1927 ย่านบาชามิจิ โดดเด่นด้วยเมนูเนื้อหมูสันในชุบเกล็ดขนมปังสดทอด (Hirekatsu) กรอบนอกนุ่มฉ่ำไม่อมน้ำมัน พร้อมซอสสูตรลับเข้มข้นที่เคี่ยวนาน เสิร์ฟคู่กับข้าวญี่ปุ่นร้อน ๆ และกะหล่ำปลีซอยเติมได้ไม่อั้น',
    gallery: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000',
      'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=1000',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Manchinro Honten (Yokohama Chinatown)',
    province: 'คานางาวะ',
    starting_price: 2500,
    open_time: '11:00:00',
    close_time: '22:00:00',
    latitude: 35.4434,
    longitude: 139.6445,
    image_url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=1000',
    description: 'ภัตตาคารอาหารกวางตุ้งและติ่มซำเก่าแก่ที่มีชื่อเสียงที่สุดในย่านโยโกฮาม่าไชน่าทาวน์ ก่อตั้งขึ้นตั้งแต่ปี ค.ศ. 1892 บรรยากาศหรูหราอลังการสไตล์พระราชวังจีน เสิร์ฟติ่มซำปั้นสด เป็ดย่างเลิศรส และอาหารจีนกวางตุ้งรสชาติประณีตระดับไฟน์ไดนิ่ง',
    gallery: [
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=1000',
      'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1000',
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1000',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Yoshimuraya (ต้นตำรับ Iekei Ramen โยโกฮาม่า)',
    province: 'คานางาวะ',
    starting_price: 800,
    open_time: '11:00:00',
    close_time: '20:00:00',
    latitude: 35.4630,
    longitude: 139.6151,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000',
    description: 'บ้านเกิดต้นตำรับราเมงสาย "อิเอเค" (Iekei Ramen) อันโด่งดังไปทั่วโลก ก่อตั้งในปี 1974 จุดเด่นคือน้ำซุปเข้มข้นเคี่ยวกระดูกหมูและซีอิ๊วโชยุสูตรพิเศษ เสิร์ฟพร้อมเส้นหนาเหนียวนุ่ม หมูชาชูรมควัน ผักโขม และสาหร่ายแผ่นใหญ่ สามารถเลือกระดับความมัน ความเค็ม และความนุ่มของเส้นได้ตามต้องการ',
    gallery: [
      'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000',
      'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?q=80&w=1000',
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=1000',
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Tobicho (สาขาหลัก เกาะ Enoshima)',
    province: 'คานางาวะ',
    starting_price: 1280,
    open_time: '11:00:00',
    close_time: '20:00:00',
    latitude: 35.3013,
    longitude: 139.4823,
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
    description: 'ร้านอาหารทะเลและข้าวหน้าปลาชิราสึ (Shirasu-don) อันดับหนึ่งแห่งเกาะเอโนะชิมะ เมืองฟูจิซาวะ ขึ้นชื่อเรื่องปลาข้าวสารตัวเล็กสดใหม่ที่จับขึ้นมาจากอ่าวซากามิ มีทั้งแบบต้มสุกเนื้อนุ่มหวาน และแบบสดใสตามฤดูกาล เสิร์ฟในชามขนาดใหญ่คู่กับไข่ลวกและซอสสูตรเด็ดของทางร้าน',
    gallery: [
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1000',
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Kamakura Matsubara-an (Yuigahama)',
    province: 'คานางาวะ',
    starting_price: 2100,
    open_time: '11:00:00',
    close_time: '21:00:00',
    latitude: 35.3114,
    longitude: 139.5410,
    image_url: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?q=80&w=1000',
    description: 'ร้านโซบะและอาหารไคเซกิชื่อดังแห่งเมืองคามาคุระ ตั้งอยู่ในคฤหาสน์สไตล์ญี่ปุ่นโบราณอายุกว่า 100 ปี ท่ามกลางสวนอันเงียบสงบใกล้หาดยูอิกาฮามะ เสิร์ฟเส้นโซบะทำมือเหนียวนุ่มหอมแป้งโซบะสด ทานคู่กับเทมปุระอาหารทะเลทอดกรอบไม่อมน้ำมัน และสาเกคัดสรรจากท้องถิ่น',
    gallery: [
      'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=1000',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000'
    ]
  }
];

async function insertKanagawaPlaces() {
  const conn = await pool.getConnection();
  try {
    for (const p of kanagawaRestaurants) {
      const [existing] = await conn.query('SELECT restaurant_id FROM restaurants WHERE name = ?', [p.name]);
      let restId;
      if (existing.length > 0) {
        restId = existing[0].restaurant_id;
        await conn.query(
          'UPDATE restaurants SET description=?, province=?, starting_price=?, open_time=?, close_time=?, latitude=?, longitude=?, image_url=? WHERE restaurant_id=?',
          [p.description, p.province, p.starting_price, p.open_time, p.close_time, p.latitude, p.longitude, p.image_url, restId]
        );
        console.log('Updated existing:', p.name, 'ID:', restId);
      } else {
        const [res] = await conn.query(
          'INSERT INTO restaurants (name, description, province, starting_price, open_time, close_time, latitude, longitude, image_url, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
          [p.name, p.description, p.province, p.starting_price, p.open_time, p.close_time, p.latitude, p.longitude, p.image_url]
        );
        restId = res.insertId;
        console.log('Inserted new:', p.name, 'ID:', restId);
      }

      await conn.query('DELETE FROM restaurant_images WHERE restaurant_id = ?', [restId]);
      for (const img of p.gallery) {
        await conn.query('INSERT INTO restaurant_images (restaurant_id, file_name) VALUES (?, ?)', [restId, img]);
      }
    }
    console.log('All 5 Kanagawa restaurants inserted successfully with >3 gallery images each!');
  } finally {
    conn.release();
    process.exit(0);
  }
}

insertKanagawaPlaces().catch((err) => {
  console.error('Error inserting Kanagawa places:', err);
  process.exit(1);
});
