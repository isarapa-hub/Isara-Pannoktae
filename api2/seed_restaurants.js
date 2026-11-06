const pool = require('./db');

const places = [
  {
    name: 'ร้าน Ichiran Ramen (สาขา Shibuya)',
    province: 'โตเกียว',
    starting_price: 980,
    open_time: '10:00:00',
    close_time: '23:00:00',
    latitude: 35.6619,
    longitude: 139.7005,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000',
    description: 'ร้านราเมงกระดูกหมูทงคัตสึชื่อดังระดับตำนานจากฟุกุโอกะ หรือที่คนไทยรู้จักกันดีในชื่อ "ราเมงข้อสอบ" เอกลักษณ์โดดเด่นคือโต๊ะนั่งรับประทานแบบช่องเดี่ยวพร้อมม่านกั้น ให้คุณดื่มด่ำกับรสชาติน้ำซุปสูตรเข้มข้นที่เคี่ยวนานกว่าสิบชั่วโมงอย่างเป็นส่วนตัว ลูกค้าสามารถทำแบบสอบถามเลือกปรับแต่งความเข้มข้นของซุป ความนุ่มของเส้นราเมง และระดับความเผ็ดของซอสแดงสูตรลับเฉพาะได้ตามใจชอบ',
    gallery: [
      'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000',
      'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Gyukatsu Motomura (สาขา Shibuya)',
    province: 'โตเกียว',
    starting_price: 1930,
    open_time: '11:00:00',
    close_time: '22:00:00',
    latitude: 35.6580,
    longitude: 139.7032,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000',
    description: 'ร้านเนื้อวัวชุบเกล็ดขนมปังทอด (Gyukatsu) อันดับหนึ่งในใจนักท่องเที่ยว เนื้อวัวชั้นดีชุบแป้งและเกล็ดขนมปังบางกรอบทอดด้วยความร้อนสูงเพียง 60 วินาที เพื่อล็อกความหวานฉ่ำด้านในไว้แบบ Rare โดยเสิร์ฟพร้อมเตาหินร้อนส่วนตัว ให้ลูกค้าปิ้งย่างความสุกของเนื้อแต่ละชิ้นได้ด้วยตนเอง ทานคู่กับซอสโชยุ วาซาบิสด ซอสหัวหอม และข้าวบาร์เลย์ร้อน ๆ อิ่มอร่อยกลมกล่อมลงตัว',
    gallery: [
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1000',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Sushi Dai Honkan (Tsukiji)',
    province: 'โตเกียว',
    starting_price: 3500,
    open_time: '10:30:00',
    close_time: '22:00:00',
    latitude: 35.6653,
    longitude: 139.7707,
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
    description: 'ร้านเอโดะมาเอะซูชิยอดนิยมใจกลางย่านตลาดนอกซึคิจิ คัดสรรวัตถุดิบปลาและอาหารทะเลสดใหม่ส่งตรงจากตลาดปลาทุกเช้า ปั้นสดคำต่อคำโดยเชฟซูชิผู้เชี่ยวชาญ เมนูแนะนำคือเซต Omakase นิกิริซูชิ 10 คำ พร้อมซูชิโอโทโร่เนื้อนุ่มละลายในปาก ไข่หอยเม่นสดหวาน และซุปมิโซะปลาสูตรเข้มข้น รสชาติแบบญี่ปุ่นดั้งเดิมแท้ๆ',
    gallery: [
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1000',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Katsuretsu An (สาขาหลัก Bashamichi)',
    province: 'คานางาวะ',
    starting_price: 1800,
    open_time: '11:00:00',
    close_time: '21:00:00',
    latitude: 35.4485,
    longitude: 139.6358,
    image_url: 'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
    description: 'ร้านทงคัตสึเก่าแก่ระดับตำนานแห่งเมืองโยโกฮาม่า จังหวัดคานางาวะ เปิดให้บริการมาตั้งแต่ปี ค.ศ. 1927 โดดเด่นด้วยเนื้อหมูสันใน (Hirekatsu) นุ่มพิเศษชุบเกล็ดขนมปังสดทอดจนเหลืองทองไม่อมน้ำมัน ทานคู่กับซอสทงคัตสึสูตรลับเฉพาะของร้านที่เคี่ยวผสมผักและผลไม้นานนับวันจนได้รสหวานกลมกล่อม เสิร์ฟพร้อมกะหล่ำปลีซอยและข้าวญี่ปุ่นเติมได้ไม่อั้น',
    gallery: [
      'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000',
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Chuka Soba Tomita (Matsudo)',
    province: 'ชิบะ',
    starting_price: 1200,
    open_time: '11:00:00',
    close_time: '16:00:00',
    latitude: 35.7865,
    longitude: 139.9015,
    image_url: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1000',
    description: 'สุดยอดราเมงและสึเคเมนอันดับหนึ่งของประเทศญี่ปุ่นแห่งเมืองมัตสึโดะ จังหวัดชิบะ เจ้าของรางวัลเกียรติยศสูงสุดระดับประเทศต่อเนื่องหลายปี โดดเด่นด้วยเส้นสดโฮมเมดหนานุ่มทำจากแป้งสาลีพันธุ์พิเศษ และน้ำซุปเข้มข้นเคี่ยวกระดูกหมู ผสมผสานปลาแห้งและซีฟู้ดนานกว่า 20 ชั่วโมงจนได้รสชาติอูมามิที่ล้ำลึก หอมกรุ่น เป็นร้านที่นักชิมทั่วโลกต่างเดินทางมาลิ้มลอง',
    gallery: [
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=1000',
      'https://images.unsplash.com/photo-1623341214825-9f4f963727da?q=80&w=1000'
    ]
  }
];

async function insertPlaces() {
  const conn = await pool.getConnection();
  try {
    for (const p of places) {
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
    console.log('All 5 restaurants inserted successfully!');
  } finally {
    conn.release();
    process.exit(0);
  }
}

insertPlaces().catch((err) => {
  console.error('Error inserting places:', err);
  process.exit(1);
});
