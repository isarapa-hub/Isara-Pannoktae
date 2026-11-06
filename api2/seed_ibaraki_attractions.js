const pool = require('./db');

const ibarakiAttractions = [
  {
    name: 'สวนฮิตาชิ ซีไซด์ พาร์ค (Hitachi Seaside Park)',
    province: 'อิบารากิ',
    starting_price: 450,
    open_time: '09:30:00',
    close_time: '17:00:00',
    latitude: 36.3967,
    longitude: 140.5347,
    image_url: 'https://images.unsplash.com/photo-1490750967868-88aa4486c946?q=80&w=1000',
    description: 'สวนสาธารณะริมทะเลขนาดมหึมาในเมืองฮิตาชินากะ มีชื่อเสียงระดับโลกจากเนินเขามิฮาราชิ (Miharashi Hill) ที่แปรเปลี่ยนสีสันตามฤดูกาลอย่างน่าอัศจรรย์ โดยในฤดูใบไม้ผลิจะถูกย้อมเป็นสีฟ้าครามด้วยทุ่งดอกเนโมฟิลา (Nemophila) กว่า 5.3 ล้านดอกตัดกับสีน้ำทะเลและท้องฟ้า และในฤดูใบไม้ร่วงจะเปลี่ยนเป็นทุ่งพุ่มไม้โคเชีย (Kochia) สีแดงสดสะพรั่ง พร้อมชิงช้าสวรรค์ขนาดยักษ์และเส้นทางปั่นจักรยานเลียบชายฝั่ง',
    gallery: [
      'https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=1000',
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1000',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?q=80&w=1000',
      'https://images.unsplash.com/photo-1513889961551-628c1e5e2ee9?q=80&w=1000'
    ]
  },
  {
    name: 'พระใหญ่อุชิคุ ไดบุตสึ (Ushiku Daibutsu)',
    province: 'อิบารากิ',
    starting_price: 800,
    open_time: '09:30:00',
    close_time: '17:00:00',
    latitude: 35.9825,
    longitude: 140.2203,
    image_url: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1000',
    description: 'พระพุทธรูปสัมฤทธิ์ปางยืนที่สูงที่สุดแห่งหนึ่งของโลก ด้วยความสูงรวมฐานถึง 120 เมตร สร้างขึ้นเพื่อเป็นพุทธบูชาในปี 1993 ภายในองค์พระแบ่งออกเป็น 5 ชั้น มีลิฟต์พาขึ้นไปยังหอชมวิวที่ระดับความสูง 85 เมตรเพื่อชมทัศนียภาพกว้างไกลถึงภูเขาไฟฟูจิและโตเกียวสกายทรี ล้อมรอบด้วยสวนดอกไม้ตามฤดูกาลและสวนสัตว์ขนาดย่อมที่ร่มรื่น',
    gallery: [
      'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=1000',
      'https://images.unsplash.com/photo-1545569341-9eb8b30979d9?q=80&w=1000',
      'https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?q=80&w=1000',
      'https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?q=80&w=1000'
    ]
  },
  {
    name: 'ศาลเจ้าโออาไร อิโซซากิ (Oarai Isosaki Shrine)',
    province: 'อิบารากิ',
    starting_price: 0,
    open_time: '06:00:00',
    close_time: '17:00:00',
    latitude: 36.3149,
    longitude: 140.5895,
    image_url: 'https://images.unsplash.com/photo-1528360983277-13d401cdc186?q=80&w=1000',
    description: 'ศาลเจ้าชินโตริมมหาสมุทรแปซิฟิก ก่อตั้งขึ้นตั้งแต่ปี ค.ศ. 856 ไฮไลต์เลื่องชื่อระดับโลกคือ "เสาโทริอิแห่งคามิอิโซะ" (Kamiiso no Torii) เสาโทริอิหินที่ตั้งตระหง่านอยู่บนโขดหินกลางเกลียวคลื่นทะเลที่ซัดสาด เป็นจุดชมพระอาทิตย์ขึ้นที่งดงามและศักดิ์สิทธิ์ที่สุดแห่งหนึ่งในญี่ปุ่น ดึงดูดช่างภาพและผู้แสวงบุญจากทั่วโลกให้มาเยือน',
    gallery: [
      'https://images.unsplash.com/photo-1518837695005-2083093ee35b?q=80&w=1000',
      'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1000',
      'https://images.unsplash.com/photo-1492571350019-22de08371fd3?q=80&w=1000',
      'https://images.unsplash.com/photo-1514933651103-005eec06c04b?q=80&w=1000'
    ]
  },
  {
    name: 'น้ำตกฟุคุโรดะ (Fukuroda Falls)',
    province: 'อิบารากิ',
    starting_price: 300,
    open_time: '08:00:00',
    close_time: '18:00:00',
    latitude: 36.7644,
    longitude: 140.4076,
    image_url: 'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?q=80&w=1000',
    description: 'หนึ่งใน "สามสุดยอดน้ำตกของญี่ปุ่น" (Nihon Sanmeibaku) สูง 120 เมตร และกว้าง 73 เมตร สายน้ำไหลลดหลั่นลงมาตามหน้าผาหินขนาดใหญ่ 4 ระดับ จนได้รับฉายาว่า "น้ำตกสี่ชั้น" (Yondo no Taki) มีความงดงามแตกต่างกันในทั้ง 4 ฤดู โดยเฉพาะใบไม้เปลี่ยนสีในฤดูใบไม้ร่วง และปรากฏการณ์น้ำตกกลายเป็นน้ำแข็งยักษ์ (Hyobaku) อันน่าอัศจรรย์ในฤดูหนาว',
    gallery: [
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=1000',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1000',
      'https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1000',
      'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1000'
    ]
  },
  {
    name: 'สวนไคราคุเอน (Kairakuen Garden Mito)',
    province: 'อิบารากิ',
    starting_price: 300,
    open_time: '06:00:00',
    close_time: '19:00:00',
    latitude: 36.3731,
    longitude: 140.4561,
    image_url: 'https://images.unsplash.com/photo-1578632767115-351597cf2477?q=80&w=1000',
    description: 'หนึ่งใน "สามสวนสวยที่สุดของญี่ปุ่น" (Nihon Sanmeien) สร้างขึ้นในปี ค.ศ. 1842 โดยไดเมียวโทกูงาวะ นาริอากิ โดดเด่นด้วยต้นบ๊วยกว่า 3,000 ต้น จาก 100 สายพันธุ์ ที่ส่งกลิ่นหอมและผลิดอกบานสะพรั่งในช่วงต้นฤดูใบไม้ผลิ ภายในยังมีศาลาไม้โบราณโคบุนเต (Kobuntei) ป่าไผ่เขียวขจี และวิวทะเลสาบเซนบะอันเงียบสงบ',
    gallery: [
      'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=1000',
      'https://images.unsplash.com/photo-1500595046743-cd271d694d30?q=80&w=1000',
      'https://images.unsplash.com/photo-1595855759920-86582396756a?q=80&w=1000',
      'https://images.unsplash.com/photo-1520105072000-f44fc083e508?q=80&w=1000'
    ]
  }
];

async function insertIbarakiAttractions() {
  const conn = await pool.getConnection();
  try {
    for (const a of ibarakiAttractions) {
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
    console.log('All 5 Ibaraki attractions inserted successfully with >3 gallery images each!');
  } finally {
    conn.release();
    process.exit(0);
  }
}

insertIbarakiAttractions().catch((err) => {
  console.error('Error inserting Ibaraki attractions:', err);
  process.exit(1);
});
