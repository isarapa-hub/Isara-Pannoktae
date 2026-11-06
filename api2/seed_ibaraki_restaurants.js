const pool = require('./db');

const ibarakiRestaurants = [
  {
    name: 'ร้าน Restaurant Iijima (Mito)',
    province: 'อิบารากิ',
    starting_price: 3500,
    open_time: '11:00:00',
    close_time: '21:30:00',
    latitude: 36.3769,
    longitude: 140.4316,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000',
    description: 'ภัตตาคารสเต๊กและเนื้อวากิวระดับตำนานแห่งเมืองมิโตะ ก่อตั้งเมื่อปี ค.ศ. 1963 โดยผู้เชี่ยวชาญด้านเนื้อสัตว์ชั้นนำ "Niku no Iijima" คัดสรรเฉพาะเนื้อวัวคุโรเกะวากิวสายพันธุ์แท้ของอิบารากิ "เนื้อฮิตาชิ" (Hitachi Beef) ระดับ A4 และ A5 นำมารังสรรค์เป็นสเต๊กย่างเตาถ่าน สุกี้ยากี้ ชาบูชาบู และแฮมเบิร์กเนื้อวากิวฉ่ำลิ้น ละลายในปาก พร้อมไวน์ชั้นดีในบรรยากาศคลาสสิกหรูหรา',
    gallery: [
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1000',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000',
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000'
    ]
  },
  {
    name: 'ร้านอาหารพื้นเมือง Sansui (Mito)',
    province: 'อิบารากิ',
    starting_price: 4000,
    open_time: '11:30:00',
    close_time: '21:00:00',
    latitude: 36.3785,
    longitude: 140.4636,
    image_url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=1000',
    description: 'ร้านอาหารพื้นเมืองมิโตะระดับตำนาน ก่อตั้งขึ้นตั้งแต่ปี ค.ศ. 1948 เป็นผู้คิดค้นและต้นตำรับเมนูหม้อไฟปลาอังโกะ "Ganso Anko Nabe" อันโด่งดัง โดยใช้ปลาอังโกะ (Anglerfish) สดจากทะเล ผสานตับปลาอังโกะบดละเอียดกับมิโซะสูตรโบราณจนได้น้ำซุปเข้มข้นรสอูมามิ (Dobu-jiru) พร้อมเสิร์ฟเมนูอาหารจากนัตโตะมิโตะแท้ ๆ เช่น ข้าวหน้านัตโตะทรงเครื่อง และไก่ย่างโอคุคุจิแสนอร่อย',
    gallery: [
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Kaachan no Mise (Oarai Port)',
    province: 'อิบารากิ',
    starting_price: 1300,
    open_time: '10:00:00',
    close_time: '15:00:00',
    latitude: 36.3113,
    longitude: 140.5813,
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
    description: 'ร้านอาหารทะเลพื้นบ้านยอดนิยม ดำเนินการโดยกลุ่มแม่บ้านของสหกรณ์การประมงโออาไร (Oarai Fishermen\'s Co-op) ตั้งอยู่ติดริมท่าเรือประมงโออาไร วัตถุดิบสดใหม่ส่งตรงจากเรือประมงทุกเช้า เมนูซิกเนเจอร์คือ "Kamaage Shirasu-don" ข้าวหน้าปลาชิราสึต้มสุกเนื้อนุ่มฟูหวานธรรมชาติ และ "Nama Shirasu-don" (ปลาชิราสึสดตามฤดูกาล) เสิร์ฟพร้อมต้มส้มซุปปลาท้องถิ่นและปลาทอดกรอบสูตรคุณแม่ชาวประมง',
    gallery: [
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1000',
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Yamasa Suisan Ichiba Shokudo (Nakaminato)',
    province: 'อิบารากิ',
    starting_price: 1800,
    open_time: '09:00:00',
    close_time: '16:00:00',
    latitude: 36.3403,
    longitude: 140.5948,
    image_url: 'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000',
    description: 'ภัตตาคารอาหารทะเลและตลาดปลาชื่อดังใจกลางตลาดปลานาคามินาโตะ (Nakaminato Fish Market) เมืองฮิตาชินากะ โดดเด่นด้วยข้าวหน้าปลาดิบรวม "ไคเซ็นด้ง" (Kaisen-don) ชิ้นโตพูนชาม ทั้งปลาทูน่า แซลมอน ปลาหมึก หอยเม่น ไข่ปลาแซลมอน และปลาตามฤดูกาลที่ประมูลสด ๆ จากอ่าวคาชิมะ พร้อมซูชิสายพานจานยักษ์และหอยนางรมสดตัวโตที่แกะทานสด ๆ หน้าร้าน',
    gallery: [
      'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1000',
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000',
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Stamina Ramen Matsugoro (Mito)',
    province: 'อิบารากิ',
    starting_price: 850,
    open_time: '11:00:00',
    close_time: '21:00:00',
    latitude: 36.3945,
    longitude: 140.4491,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000',
    description: 'ร้านต้นตำรับแห่ง "สตามิน่าราเมง" (Ibaraki Stamina Ramen) เมนูราเมงจิตวิญญาณประจำจังหวัดอิบารากิที่คิดค้นขึ้นตั้งแต่ยุคโชวะ จุดเด่นคือน้ำราดข้นเหนียวรสเผ็ดหวานกลมกล่อมที่ผัดจากตับหมูชุบแป้งทอดกรอบ ฟักทองญี่ปุ่นชิ้นโต กะหล่ำปลี และแครอท นำมาราดบนเส้นราเมงโฮมเมดเส้นหนาเหนียวนุ่ม มีให้เลือกทั้งแบบเสิร์ฟร้อนในน้ำซุปโชยุ และแบบ "Stamina Hiyashi" ที่นำเส้นราเมงไปล้างน้ำเย็นแล้วราดซอสร้อน ๆ ด้านบน',
    gallery: [
      'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000',
      'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?q=80&w=1000',
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=1000',
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1000'
    ]
  }
];

async function insertIbarakiRestaurants() {
  const conn = await pool.getConnection();
  try {
    for (const r of ibarakiRestaurants) {
      const [existing] = await conn.query('SELECT restaurant_id FROM restaurants WHERE name = ?', [r.name]);
      let restId;
      if (existing.length > 0) {
        restId = existing[0].restaurant_id;
        await conn.query(
          'UPDATE restaurants SET name=?, description=?, province=?, starting_price=?, open_time=?, close_time=?, latitude=?, longitude=?, image_url=? WHERE restaurant_id=?',
          [r.name, r.description, r.province, r.starting_price, r.open_time, r.close_time, r.latitude, r.longitude, r.image_url, restId]
        );
        console.log('Updated existing restaurant:', r.name, 'ID:', restId);
      } else {
        const [res] = await conn.query(
          'INSERT INTO restaurants (name, description, province, starting_price, open_time, close_time, latitude, longitude, image_url, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
          [r.name, r.description, r.province, r.starting_price, r.open_time, r.close_time, r.latitude, r.longitude, r.image_url]
        );
        restId = res.insertId;
        console.log('Inserted new restaurant:', r.name, 'ID:', restId);
      }

      await conn.query('DELETE FROM restaurant_images WHERE restaurant_id = ?', [restId]);
      for (const img of r.gallery) {
        await conn.query('INSERT INTO restaurant_images (restaurant_id, file_name) VALUES (?, ?)', [restId, img]);
      }
    }
    console.log('All 5 Ibaraki restaurants inserted successfully with >3 gallery images each!');
  } finally {
    conn.release();
    process.exit(0);
  }
}

insertIbarakiRestaurants().catch((err) => {
  console.error('Error inserting Ibaraki restaurants:', err);
  process.exit(1);
});
