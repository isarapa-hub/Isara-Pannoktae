const pool = require('./db');

const chibaAttractions = [
  {
    name: 'โตเกียวดิสนีย์แลนด์ (Tokyo Disneyland)',
    province: 'ชิบะ',
    starting_price: 7900,
    open_time: '09:00:00',
    close_time: '21:00:00',
    latitude: 35.6329,
    longitude: 139.8803,
    image_url: 'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=1000',
    description: 'สวนสนุกระดับโลกแห่งแรกของดิสนีย์นอกสหรัฐอเมริกา ตั้งอยู่ในเมืองอุรายาสึ จังหวัดชิบะ ดินแดนแห่งความฝันและเวทมนตร์ที่แบ่งออกเป็น 7 โซนหลัก เช่น World Bazaar, Fantasyland, Tomorrowland และ Adventureland เพลิดเพลินกับเครื่องเล่นยอดนิยมระดับตำนาน ปราสาทซินเดอเรลล่าอันสง่างาม ขบวนพาเหรดสุดตระการตา และการแสดงพลุไฟยามค่ำคืน',
    gallery: [
      'https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=1000',
      'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1000',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000',
      'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?q=80&w=1000'
    ]
  },
  {
    name: 'วัดนาริตะซัง ชินโชจิ (Naritasan Shinshoji Temple)',
    province: 'ชิบะ',
    starting_price: 0,
    open_time: '06:00:00',
    close_time: '16:00:00',
    latitude: 35.7854,
    longitude: 140.3179,
    image_url: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000',
    description: 'วัดพุทธนิกายชินงอนเก่าแก่อายุกว่า 1,000 ปีที่มีชื่อเสียงที่สุดแห่งหนึ่งของญี่ปุ่น ตั้งอยู่ใกล้สนามบินนานาชาตินาริตะ เป็นสถานที่ประดิษฐานองค์พระฟุโดเมียวโออันศักดิ์สิทธิ์ โดดเด่นด้วยเจดีย์สามชั้นสูงตระหง่าน สวนสไตล์ญี่ปุ่นขนาดใหญ่ และถนนคนเดินโอโมเตะซันโดด้านหน้าวัดที่เรียงรายไปด้วยร้านขายปลาไหลย่างและขนมดั้งเดิม',
    gallery: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000',
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1000',
      'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000',
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1000'
    ]
  },
  {
    name: 'ภูเขาโนโกกิริและวัดนิฮอนจิ (Mount Nokogiri & Nihonji Temple)',
    province: 'ชิบะ',
    starting_price: 700,
    open_time: '09:00:00',
    close_time: '16:30:00',
    latitude: 35.1564,
    longitude: 139.8321,
    image_url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000',
    description: 'แหล่งท่องเที่ยวธรรมชาติและประวัติศาสตร์อันน่าทึ่งบนภูเขาฟันเลื่อย (Nokogiriyama) ริมอ่าวโตเกียว ไฮไลต์คือ "จุดชมวิวส่องนรก" (Jigoku Nozoki) หน้าผาหินสูงชันยื่นออกไปในอากาศมองเห็นวิวพาโนรามาของอ่าวโตเกียวและภูเขาไฟฟูจิ พร้อมสักการะพระพุทธรูปหินแกะสลักหน้าผา (Nihonji Daibutsu) ที่ใหญ่ที่สุดแห่งหนึ่งในญี่ปุ่น และพระอรหันต์หินกว่า 1,500 องค์',
    gallery: [
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000',
      'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1000'
    ]
  },
  {
    name: 'คาโมกาวะ ซีเวิลด์ (Kamogawa Sea World)',
    province: 'ชิบะ',
    starting_price: 3300,
    open_time: '09:00:00',
    close_time: '16:30:00',
    latitude: 35.1141,
    longitude: 140.1173,
    image_url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=1000',
    description: 'พิพิธภัณฑ์สัตว์น้ำและธีมปาร์คทางทะเลชั้นนำของญี่ปุ่น ตั้งอยู่ติดริมชายฝั่งมหาสมุทรแปซิฟิกในเมืองคาโมกาวะ ไฮไลต์ชื่อดังระดับประเทศคือการแสดงสดของวาฬเพชฌฆาต (Orca) อันทรงพลังและน่าตื่นตาตื่นใจ พร้อมชมความน่ารักของโลมา วาฬเบลูกา แมวน้ำ เพนกวิน และโซนจัดแสดงสัตว์ทะเลนานาชนิดแบบใกล้ชิด',
    gallery: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1000',
      'https://images.unsplash.com/photo-1534567153574-2b12153a87f0?q=80&w=1000',
      'https://images.unsplash.com/photo-1568430462989-44163eb1752f?q=80&w=1000',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000'
    ]
  },
  {
    name: 'มาเธอร์ฟาร์ม (Mother Farm)',
    province: 'ชิบะ',
    starting_price: 1500,
    open_time: '09:30:00',
    close_time: '16:30:00',
    latitude: 35.2453,
    longitude: 139.9346,
    image_url: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1000',
    description: 'ฟาร์มท่องเที่ยวเชิงธรรมชาติและทุ่งดอกไม้ขนาดใหญ่บนเนินเขาคาโนซัง เมืองฟุตสึ โดดเด่นด้วยทุ่งดอกไม้ตามฤดูกาลสีสันสดใสที่เบ่งบานเต็มภูเขา และกิจกรรมสัมผัสสัตว์แสนน่ารัก เช่น การแสดงต้อนฝูงแกะ วิ่งแข่งหมูน้อย ป้อนอาหารอัลปาก้า ขี่ม้า รวมถึงชิมซอฟต์เสิร์ฟไอศกรีมนมสดแท้และผลไม้สดจากฟาร์ม',
    gallery: [
      'https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=1000',
      'https://images.unsplash.com/photo-1484557052118-f32bd25b45b5?q=80&w=1000',
      'https://images.unsplash.com/photo-1516467508483-a7212febe31a?q=80&w=1000',
      'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=1000'
    ]
  }
];

async function insertChibaAttractions() {
  const conn = await pool.getConnection();
  try {
    for (const a of chibaAttractions) {
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
    console.log('All 5 Chiba attractions inserted successfully with >3 gallery images each!');
  } finally {
    conn.release();
    process.exit(0);
  }
}

insertChibaAttractions().catch((err) => {
  console.error('Error inserting Chiba attractions:', err);
  process.exit(1);
});
