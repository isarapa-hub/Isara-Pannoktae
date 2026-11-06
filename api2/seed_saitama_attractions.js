const pool = require('./db');

const saitamaAttractions = [
  {
    name: 'ย่านเมืองเก่าคาวาโกเอะและหอระฆังโทกิโนะคาเนะ (Kawagoe Kurazukuri & Toki no Kane)',
    province: 'ไซตามะ',
    starting_price: 0,
    open_time: '09:00:00',
    close_time: '18:00:00',
    latitude: 35.9235,
    longitude: 139.4833,
    image_url: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000',
    description: 'ย่านประวัติศาสตร์ชื่อดังที่ได้รับการขนานนามว่า "โคเอโดะ" (Little Edo) โดดเด่นด้วยอาคารพาณิชย์ดินเผาสีดำโบราณสไตล์คุราสึคุริ (Kurazukuri) ที่อนุรักษ์ไว้อย่างสมบูรณ์ตั้งแต่สมัยเอโดะ มีแลนด์มาร์กสำคัญคือ "หอระฆังบอกเวลาโทกิโนะคาเนะ" (Toki no Kane) หอระฆังไม้โบราณสูง 16 เมตรที่คอยตีระฆังบอกเวลาวันละ 4 รอบ พร้อมเพลิดเพลินกับตรอกขนมหวานคาชิยะโยโคโชะ และเมนูมันหวานเลื่องชื่อ',
    gallery: [
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1000',
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1000',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000',
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000'
    ]
  },
  {
    name: 'ศาลเจ้าฮิกาวะ คาวาโกเอะ (Kawagoe Hikawa Shrine)',
    province: 'ไซตามะ',
    starting_price: 0,
    open_time: '09:00:00',
    close_time: '17:00:00',
    latitude: 35.9276,
    longitude: 139.4885,
    image_url: 'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1000',
    description: 'ศาลเจ้าชินโตโบราณอายุกว่า 1,500 ปีที่เลื่องชื่อเรื่องการขอพรความรัก เนื้อคู่ และความผูกพันของครอบครัว ไฮไลต์ยอดนิยมคืออุโมงค์แผ่นป้ายขอพรเอมะไม้ (Ema Tunnel) จุดตกเซียมซีรูปปลาไทสีชมพูและแดงเพื่อทำนายดวงความรัก และเทศกาลกระดิ่งลมฤดูร้อน (Enmusubi Furin) ที่ประดับกระดิ่งลมแก้วหลากสีสันนับพันลูกส่งเสียงกังวานทั่วศาลเจ้า',
    gallery: [
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1000',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1000',
      'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000'
    ]
  },
  {
    name: 'สวนฮิตสึจิยามะ ชิชิบุ (Hitsujiyama Park)',
    province: 'ไซตามะ',
    starting_price: 300,
    open_time: '08:00:00',
    close_time: '17:00:00',
    latitude: 35.9907,
    longitude: 139.0838,
    image_url: 'https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=1000',
    description: 'จุดชมทุ่งดอกชิบะซากุระ (พิงค์มอส) ที่งดงามและโด่งดังที่สุดในภูมิภาคคันโต ตั้งอยู่บนเนินเขาเมืองชิชิบุ ในช่วงฤดูใบไม้ผลิ ดอกมอสสีชมพู ม่วง และขาวกว่า 400,000 ต้นจาก 9 สายพันธุ์จะพร้อมใจกันบานสะพรั่งเป็นพรมดอกไม้ลวดลายคลื่นธรรมชาติ โดยมีภูเขาบุโค (Mount Buko) อันยิ่งใหญ่ตระการตาเป็นฉากหลัง',
    gallery: [
      'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1000',
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1000'
    ]
  },
  {
    name: 'มูมินวัลเลย์พาร์ค ฮันโน (Moominvalley Park Hanno)',
    province: 'ไซตามะ',
    starting_price: 3400,
    open_time: '10:00:00',
    close_time: '17:00:00',
    latitude: 35.8719,
    longitude: 139.3254,
    image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000',
    description: 'ธีมปาร์คตัวการ์ตูนมูมินแห่งแรกนอกประเทศฟินแลนด์ โอบล้อมด้วยผืนป่าธรรมชาติและทะเลสาบมิยาซาวะในเมืองฮันโน ให้บรรยากาศเสมือนหลุดเข้าไปในโลกนิทานแถบสแกนดิเนเวีย ภายในมีบ้านมูมินสีฟ้าอันเป็นเอกลักษณ์ โรงละครกลางแจ้ง นิทรรศการ Kokemus คาเฟ่สไตล์นอร์ดิก และร้านของฝากมูมินที่ใหญ่ที่สุดแห่งหนึ่งของโลก',
    gallery: [
      'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000',
      'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=1000',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000'
    ]
  },
  {
    name: 'พิพิธภัณฑ์รถไฟไซตามะ (The Railway Museum Saitama)',
    province: 'ไซตามะ',
    starting_price: 1330,
    open_time: '10:00:00',
    close_time: '17:00:00',
    latitude: 35.9214,
    longitude: 139.6179,
    image_url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?q=80&w=1000',
    description: 'พิพิธภัณฑ์รถไฟที่ยิ่งใหญ่และทันสมัยที่สุดแห่งหนึ่งของญี่ปุ่น ก่อตั้งโดยกลุ่มบริษัทรถไฟญี่ปุ่นตะวันออก (JR East) จัดแสดงตู้รถไฟและหัวรถจักรของจริงกว่า 40 ขบวน ตั้งแต่รถจักรไอน้ำรุ่นแรกในประวัติศาสตร์ ไปจนถึงรถไฟชินคันเซ็นหัวกระสุนรุ่นบุกเบิก พร้อมเครื่องจำลองการขับรถไฟเสมือนจริง และผังรถไฟจำลองขนาดใหญ่ที่สุดในญี่ปุ่น',
    gallery: [
      'https://images.unsplash.com/photo-1532105956626-9569c03602f6?q=80&w=1000',
      'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?q=80&w=1000',
      'https://images.unsplash.com/photo-1541427468627-a89a96e5ca1d?q=80&w=1000',
      'https://images.unsplash.com/photo-1520105072000-f44fc083e508?q=80&w=1000'
    ]
  }
];

async function insertSaitamaAttractions() {
  const conn = await pool.getConnection();
  try {
    for (const a of saitamaAttractions) {
      const [existing] = await conn.query('SELECT attraction_id FROM attractions WHERE name = ?', [a.name]);
      let attrId;
      if (existing.length > 0) {
        attrId = existing[0].attraction_id;
        await conn.query(
          'UPDATE attractions SET description=?, province=?, starting_price=?, open_time=?, close_time=?, latitude=?, longitude=?, image_url=? WHERE attraction_id=?',
          [a.description, a.province, a.starting_price, a.open_time, a.close_time, a.latitude, a.longitude, a.image_url, attrId]
        );
        console.log('Updated existing attraction:', a.name, 'ID:', attrId);
      } else {
        const [res] = await conn.query(
          'INSERT INTO attractions (name, description, province, starting_price, open_time, close_time, latitude, longitude, image_url, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0)',
          [a.name, a.description, a.province, a.starting_price, a.open_time, a.close_time, a.latitude, a.longitude, a.image_url]
        );
        attrId = res.insertId;
        console.log('Inserted new attraction:', a.name, 'ID:', attrId);
      }

      await conn.query('DELETE FROM attraction_images WHERE attraction_id = ?', [attrId]);
      for (const img of a.gallery) {
        await conn.query('INSERT INTO attraction_images (attraction_id, file_name) VALUES (?, ?)', [attrId, img]);
      }
    }
    console.log('All 5 Saitama attractions inserted successfully with >3 gallery images each!');
  } finally {
    conn.release();
    process.exit(0);
  }
}

insertSaitamaAttractions().catch((err) => {
  console.error('Error inserting Saitama attractions:', err);
  process.exit(1);
});
