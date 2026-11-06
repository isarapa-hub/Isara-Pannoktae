const pool = require('./db');

const saitamaRestaurants = [
  {
    name: 'ร้าน Ogagiku (Kawagoe)',
    province: 'ไซตามะ',
    starting_price: 3850,
    open_time: '11:00:00',
    close_time: '19:00:00',
    latitude: 35.9207,
    longitude: 139.4832,
    image_url: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=1000',
    description: 'ร้านข้าวหน้าปลาไหลระดับตำนานแห่งเมืองคาวาโกเอะ ก่อตั้งขึ้นในปลายยุคเอโดะเมื่อปี ค.ศ. 1807 สืบทอดความอร่อยมายาวนานกว่า 7 ชั่วอายุคน ในอาคารไม้โบราณ 3 ชั้นอันทรงคุณค่า โดดเด่นด้วยการคัดสรรปลาไหลน้ำจืดชั้นเลิศ นำมาย่างบนเตาถ่านอย่างพิถีพิถัน ชโลมด้วยซอสทาเระสูตรโบราณรสเข้มข้นกลมกล่อม เนื้อปลาไหลนุ่มฟูละลายในปาก เป็นหนึ่งในร้านปลาไหลที่ดีที่สุดในญี่ปุ่น',
    gallery: [
      'https://images.unsplash.com/photo-1589302168068-964664d93dc0?q=80&w=1000',
      'https://images.unsplash.com/photo-1563245372-f21724e3856d?q=80&w=1000',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1000',
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Chuka Soba Yotsuba (Kawajima)',
    province: 'ไซตามะ',
    starting_price: 950,
    open_time: '11:00:00',
    close_time: '21:00:00',
    latitude: 35.9682,
    longitude: 139.4689,
    image_url: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?q=80&w=1000',
    description: 'สุดยอดร้านราเมงอันดับ 1 ของจังหวัดไซตามะ การันตีด้วยรางวัล Tabelog Ramen Hyakumeiten ต่อเนื่องหลายปี โดดเด่นด้วยเมนูซิกเนเจอร์ "Yotsuba Soba" ราเมงซุปโชยุใสสีทองที่เคี่ยวจากเนื้อไก่สายพันธุ์พิเศษระดับพรีเมียม (Hina-jidori) ผสมผสานซีอิ๊วโชยุหมักธรรมชาติในท้องถิ่น เส้นราเมงเหนียวนุ่มลื่นคอ หมูชาชูซูวีด์นุ่มละมุน และหอยตลับสดจากทะเลรสชาติหวานละเมียดละไม',
    gallery: [
      'https://images.unsplash.com/photo-1552611052-33e04de081de?q=80&w=1000',
      'https://images.unsplash.com/photo-1591814468924-caf88d1232e1?q=80&w=1000',
      'https://images.unsplash.com/photo-1617093727343-374698b1b08d?q=80&w=1000',
      'https://images.unsplash.com/photo-1557872943-16a5ac26437e?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Buta Miso-don Honpo Nosaka (Chichibu)',
    province: 'ไซตามะ',
    starting_price: 1200,
    open_time: '11:00:00',
    close_time: '15:00:00',
    latitude: 35.9872,
    longitude: 139.0834,
    image_url: 'https://images.unsplash.com/photo-1544025162-d76694265947?q=80&w=1000',
    description: 'ร้านต้นตำรับเมนูขึ้นชื่อระดับประเทศของเมืองชิชิบุ "ข้าวหน้าหมูย่างมิโซะเตาถ่าน" (Buta Miso-don) เจ้าของรางวัลเหรียญทอง National Donburi Grand Prix คัดสรรเนื้อหมูส่วนสันนอกและสามชั้นนำมาหมักมิโซะสูตรดั้งเดิมของชิชิบุจนเข้าเนื้อ แล้วนำมาย่างด้วยเตาถ่านร้อนจัดจนหอมกลิ่นควันไหม้เกรียมกำลังดี เสิร์ฟพูนชามบนข้าวสวยร้อน ๆ กลิ่นหอมฟุ้งเย้ายวนใจ',
    gallery: [
      'https://images.unsplash.com/photo-1600891964092-4316c288032e?q=80&w=1000',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=1000',
      'https://images.unsplash.com/photo-1541696432-82c6da8ce7bf?q=80&w=1000',
      'https://images.unsplash.com/photo-1569058242253-92a9c755a0ec?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Teuchi Soba Musashiya (Chichibu)',
    province: 'ไซตามะ',
    starting_price: 1100,
    open_time: '11:30:00',
    close_time: '15:00:00',
    latitude: 35.9965,
    longitude: 139.0848,
    image_url: 'https://images.unsplash.com/photo-1618841557871-b4664fbf0cb3?q=80&w=1000',
    description: 'ร้านโซบะทำมือเก่าแก่ที่มีชื่อเสียงที่สุดแห่งเมืองชิชิบุ ตั้งอยู่บนถนนคนเดินย่านประวัติศาสตร์บัมบะโดริ ใช้น้ำแร่ธรรมชาติบริสุทธิ์จากเทือกเขาชิชิบุในการนวดแป้งบัควีทสดใหม่ทุกวัน เส้นโซบะเหนียวนุ่มหอมกรุ่น ทานคู่กับซอสจิ้มสูตรพิเศษผสมถั่ววอลนัท (Kurumi Tare) ของขึ้นชื่อประจำท้องถิ่น และเทมปุระเห็ดไมทาเกะทอดกรอบไม่อมน้ำมัน',
    gallery: [
      'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?q=80&w=1000',
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000',
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1000',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000'
    ]
  },
  {
    name: 'ร้าน Ryotei Yamaya (Kawagoe)',
    province: 'ไซตามะ',
    starting_price: 3500,
    open_time: '11:30:00',
    close_time: '21:00:00',
    latitude: 35.9225,
    longitude: 139.4821,
    image_url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?q=80&w=1000',
    description: 'ภัตตาคารอาหารญี่ปุ่นไคเซกิระดับพรีเมียม ก่อตั้งขึ้นตั้งแต่ยุคเมจิในปี ค.ศ. 1868 ตัวร้านตั้งอยู่ในคฤหาสน์และสวนญี่ปุ่นโบราณอันเงียบสงบเนื้อที่กว่า 3,000 ตารางเมตรใจกลางเมืองคาวาโกเอะ เสิร์ฟอาหารไคเซกิตามฤดูกาลที่ปรุงอย่างวิจิตรงดงามด้วยวัตถุดิบท้องถิ่นของไซตามะ ให้คุณได้ดื่มด่ำกับรสชาติอาหารชั้นเลิศพร้อมทอดสายตาชมสวนญี่ปุ่นสี่ฤดูอันร่มรื่น',
    gallery: [
      'https://images.unsplash.com/photo-1611143669185-af224c5e3252?q=80&w=1000',
      'https://images.unsplash.com/photo-1553621042-f6e147245754?q=80&w=1000',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000',
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1000'
    ]
  }
];

async function insertSaitamaRestaurants() {
  const conn = await pool.getConnection();
  try {
    for (const r of saitamaRestaurants) {
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
    console.log('All 5 Saitama restaurants inserted successfully with >3 gallery images each!');
  } finally {
    conn.release();
    process.exit(0);
  }
}

insertSaitamaRestaurants().catch((err) => {
  console.error('Error inserting Saitama restaurants:', err);
  process.exit(1);
});
