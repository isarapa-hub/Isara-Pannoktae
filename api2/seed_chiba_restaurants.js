const pool = require('./db');

const chibaRestaurants = [
  {
    name: 'ร้าน Chuka Soba Tomita (Matsudo)',
    province: 'ชิบะ',
    starting_price: 1300,
    open_time: '11:00:00',
    close_time: '15:00:00',
    latitude: 35.7818,
    longitude: 139.9009,
    image_url: 'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1000',
    description: 'ราชาแห่งวงการราเมงและสึเคเมนอันดับ 1 ของประเทศญี่ปุ่น ครองรางวัลเกียรติยศสูงสุด Tsukemen Grand Prix อย่างต่อเนื่อง โดดเด่นด้วยเส้นสดหนาเหนียวนุ่มทำเองจากแป้งสาลีคัดเกรดพิเศษ และน้ำซุปเข้มข้นที่เคี่ยวกระดูกหมู ผสมผสานปลาแห้งและซีฟู้ดนานกว่า 20 ชั่วโมงจนได้รสอูมามิที่ล้ำลึก หอมกรุ่น เป็นร้านระดับตำนานที่นักชิมทั่วโลกต่างเดินทางมาต่อคิวลิ้มลอง',
    gallery: [
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=1000',
      'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000',
      'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000',
      'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Kawatoyo Honten (Naritasan Omotesando)',
    province: 'ชิบะ',
    starting_price: 2900,
    open_time: '10:00:00',
    close_time: '17:00:00',
    latitude: 35.7834,
    longitude: 140.3166,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000',
    description: 'ร้านข้าวหน้าปลาไหลเก่าแก่ระดับตำนาน ก่อตั้งขึ้นเมื่อปี ค.ศ. 1910 บนถนนคนเดินโอโมเตะซันโด หน้าวัดนาริตะซัง ชินโชจิ จุดเด่นคือการแล่ปลาไหลสด ๆ และย่างด้วยเตาถ่านไม้บินโชตันส่งกลิ่นหอมฟุ้งหน้าร้าน เนื้อปลาไหลนุ่มฟูละลายในปาก ชโลมด้วยซอสทาเระสูตรลับเข้มข้นที่สืบทอดมารุ่นสู่รุ่นยาวนานกว่าศตวรรษ เสิร์ฟบนข้าวสวยร้อน ๆ หอมกรุ่น',
    gallery: [
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Ryoshi Ryori Kanaya (Futtsu)',
    province: 'ชิบะ',
    starting_price: 1650,
    open_time: '11:00:00',
    close_time: '17:30:00',
    latitude: 35.1854,
    longitude: 139.8183,
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
    description: 'ภัตตาคารอาหารทะเลสไตล์ชาวประมงชื่อดังริมชายฝั่งอ่าวโตเกียวในเมืองฟุตสึ โดดเด่นด้วยเมนู "โกลเด้นอาจิฟราย" (ปลาอาจิทอดกรอบนอกนุ่มฉ่ำ) วัตถุดิบปลาอาจิท้องถิ่นตัวใหญ่พิเศษ ข้าวหน้าปลาดิบรวม ไคเซ็นด้ง และเตาปิ้งย่างอาหารทะเลสด ๆ เช่น หอยเชลล์ หอยตลับ และหอยเป๋าฮื้อ พร้อมชมวิวทะเลอ่าวโตเกียวและภูเขาไฟฟูจิแบบพาโนรามา',
    gallery: [
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1000',
      'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?q=80&w=1000',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Umihotaru Marine Court (Kisarazu)',
    province: 'ชิบะ',
    starting_price: 1100,
    open_time: '09:00:00',
    close_time: '21:00:00',
    latitude: 35.4635,
    longitude: 139.8756,
    image_url: 'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=1000',
    description: 'ศูนย์รวมอาหารและภัตตาคารวิวทะเลบนเกาะจำลองอุมิโฮตารุ (Umihotaru PA) ใจกลางทางด่วนลอยน้ำข้ามอ่าวโตเกียว (Tokyo Bay Aqua-Line) เมืองคิซาราซึ เสิร์ฟเมนูขึ้นชื่อของจังหวัดชิบะอย่าง "ราเมงหอยอาซาริ" (Asari Ramen) ที่ใส่หอยตลับสดจากอ่าวโตเกียวเนื้อแน่นรสหวานในน้ำซุปเกลือทะเล และข้าวหน้าหอยอบฟุคางาวะ พร้อมทัศนียภาพ 360 องศากลางท้องทะเล',
    gallery: [
      'https://images.unsplash.com/photo-1496116218417-1a781b1c416c?q=80&w=1000',
      'https://images.unsplash.com/photo-1525755662778-989d0524087e?q=80&w=1000',
      'https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?q=80&w=1000',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Ganso Katsuura Tantanmen Ezawa (Katsuura)',
    province: 'ชิบะ',
    starting_price: 900,
    open_time: '11:30:00',
    close_time: '18:00:00',
    latitude: 35.1973,
    longitude: 140.2877,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000',
    description: 'ร้านต้นตำรับผู้คิดค้นเมนู "คัตสึอุระทันทันเมน" (Katsuura Tantanmen) เมนูราเมงรสเผ็ดอันเลื่องชื่อของชิบะ ก่อตั้งเมื่อปี ค.ศ. 1954 เพื่อสร้างความอบอุ่นให้แก่นักประดาน้ำและชาวประมงหลังขึ้นจากทะเล น้ำซุปโชยุผสานน้ำมันพริกรายุสีแดงจัดจ้าน โรยหน้าด้วยหมูสับและหัวหอมผัดจนหวานฉ่ำ เผ็ดร้อนกลมกล่อมจนได้รับรางวัล B-1 Gourmet Grand Prix ระดับประเทศ',
    gallery: [
      'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000',
      'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?q=80&w=1000',
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=1000',
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1000'
    ]
  }
];

async function insertChibaRestaurants() {
  const conn = await pool.getConnection();
  try {
    for (const r of chibaRestaurants) {
      // Find by similar name or exact name
      const [existing] = await conn.query('SELECT restaurant_id FROM restaurants WHERE name = ? OR name LIKE ?', [r.name, `%${r.name.slice(0, 15)}%`]);
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
    console.log('All 5 Chiba restaurants inserted successfully with >3 gallery images each!');
  } finally {
    conn.release();
    process.exit(0);
  }
}

insertChibaRestaurants().catch((err) => {
  console.error('Error inserting Chiba restaurants:', err);
  process.exit(1);
});
