const pool = require('./db');

const allAccommodations = [
  // ==========================================
  // 1. โตเกียว (Tokyo) - 3 ที่พัก
  // ==========================================
  {
    name: 'Palace Hotel Tokyo (พาเลซ โฮเทล โตเกียว)',
    type: 'โรงแรมหรูระดับ 5 ดาว',
    province: 'โตเกียว',
    starting_price: 68000,
    latitude: 35.6865,
    longitude: 139.7618,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
    description: 'โรงแรมหรูระดับตำนานใจกลางย่านมารุโนอุจิ ตั้งอยู่ติดกับคูเมืองและสวนพระราชวังอิมพีเรียล ทัศนียภาพแมกไม้เขียวขจีอันเงียบสงบตัดกับเส้นขอบฟ้าเมืองโตเกียว ห้องพักกว้างขวางตกแต่งสไตล์โมเดิร์นเจแปนนิส พร้อมระเบียงส่วนตัวชมวิวอันงดงาม มีห้องอาหารระดับมิชลินสตาร์ บาร์เลานจ์หรูหรา และสปาเอวิต้า (evian SPA) / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 12:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000'
    ]
  },
  {
    name: 'Hoshinoya Tokyo (โฮชิโนะยะ โตเกียว)',
    type: 'เรียวกังหรูระดับพรีเมียม',
    province: 'โตเกียว',
    starting_price: 85000,
    latitude: 35.6882,
    longitude: 139.7644,
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000',
    description: 'เรียวกังหรูแนวตั้งความสูง 17 ชั้นใจกลางย่านโอเทมาจิ สัมผัสวัฒนธรรมการต้อนรับแบบโอโมเตะนาชิแบบญี่ปุ่นดั้งเดิม ปูด้วยเสื่อทาทามิทั้งอาคาร บ่อน้ำพุร้อนออนเซ็นธรรมชาติชั้นบนสุดที่สูบขึ้นมาจากใต้ดินโตเกียวลึก 1,500 เมตร เสิร์ฟอาหารไคเซกิชั้นสูงแบบนีปปอนเรียวริ ผสมผสานเทคนิคฝรั่งเศสอย่างประณีต / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 12:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1000',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1000'
    ]
  },
  {
    name: 'The Tokyo Station Hotel (เดอะ โตเกียว สเตชั่น โฮเทล)',
    type: 'โรงแรมคลาสสิกระดับประวัติศาสตร์',
    province: 'โตเกียว',
    starting_price: 48000,
    latitude: 35.6812,
    longitude: 139.7671,
    image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1000',
    description: 'โรงแรมประวัติศาสตร์ระดับชาติที่ตั้งอยู่ภายในอาคารอิฐแดงอันงดงามของสถานีรถไฟโตเกียว อายุกว่า 100 ปี ผสมผสานสถาปัตยกรรมยุโรปคลาสสิกเข้ากับความสะดวกสบายทันสมัย เพดานห้องพักสูงโปร่ง มองเห็นวิวโดมประวัติศาสตร์และจัตุรัสหน้าสถานีโตเกียว สะดวกต่อการเดินทางไปยังทุกจุดหมายในญี่ปุ่น / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 12:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=1000',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=1000',
      'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?q=80&w=1000'
    ]
  },

  // ==========================================
  // 2. คานางาวะ (Kanagawa) - 3 ที่พัก
  // ==========================================
  {
    name: 'Hakone Kowakien Ten-yu (ฮาโกเนะ โควาคิเอ็น เทนยู)',
    type: 'ออนเซ็นเรียวกังหรู',
    province: 'คานางาวะ',
    starting_price: 42000,
    latitude: 35.2407,
    longitude: 139.0475,
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000',
    description: 'ออนเซ็นรีสอร์ตระดับไฮเอนด์ใจกลางธรรมชาติเมืองฮาโกเนะ ห้องพักทุกห้องมีอ่างออนเซ็นส่วนตัวแบบเปิดโล่ง (Rotenburo) ที่ระเบียง ชมวิวภูเขาและหุบเขาเขียวขจี มีบ่อออนเซ็นแบบอินฟินิตี้พูลมองเห็นวิวพาโนรามาลอยฟ้า อาหารค่ำคอร์สไคเซกิรังสรรค์จากวัตถุดิบท้องถิ่นตามฤดูกาล / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 11:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000',
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?q=80&w=1000',
      'https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=1000',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1000'
    ]
  },
  {
    name: 'The Yokohama Bay Hotel Tokyu (เดอะ โยโกฮาม่า เบย์ โฮเทล โทคิว)',
    type: 'โรงแรมหรูริมอ่าว',
    province: 'คานางาวะ',
    starting_price: 22000,
    latitude: 35.4578,
    longitude: 139.6347,
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000',
    description: 'โรงแรมหรูระดับแนวหน้าในย่านมินาโตะมิไร 21 (Minato Mirai) ตั้งอยู่ริมอ่าวโยโกฮาม่า ห้องพักส่วนใหญ่มีระเบียงส่วนตัวสามารถรับลมทะเลและชมวิวชิงช้าสวรรค์ Cosmo Clock 21 ยามค่ำคืนได้อย่างใกล้ชิด เชื่อมต่อกับศูนย์การค้า Queen\'s Square และสถานีรถไฟใต้ดิน Minatomirai โดยตรง / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 11:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=1000',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000',
      'https://images.unsplash.com/photo-1506059612708-99d6c258160e?q=80&w=1000'
    ]
  },
  {
    name: 'Kamakura Prince Hotel (คามาคุระ พรินซ์ โฮเทล)',
    type: 'รีสอร์ตริมชายหาด',
    province: 'คานางาวะ',
    starting_price: 19000,
    latitude: 35.3056,
    longitude: 139.5186,
    image_url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1000',
    description: 'โรงแรมรีสอร์ตตากอากาศชื่อดังริมหาดชิจิริงาฮามะ (Shichirigahama) ในเมืองคามาคุระ ห้องพักทุกห้องหันหน้าสู่ทะเลมองเห็นอ่าวซางามิและเกาะเอโนะชิมะ ในวันที่ท้องฟ้าโปร่งสามารถมองเห็นภูเขาไฟฟูจิได้อย่างงดงาม มีสระว่ายน้ำกลางแจ้งริมทะเล และห้องอาหารฝรั่งเศสบรรยากาศสุดโรแมนติก / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 11:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1000',
      'https://images.unsplash.com/photo-1587985064135-0366536eab42?q=80&w=1000',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000'
    ]
  },

  // ==========================================
  // 3. ชิบะ (Chiba) - 3 ที่พัก
  // ==========================================
  {
    name: 'Tokyo Disneyland Hotel (โตเกียว ดิสนีย์แลนด์ โฮเทล)',
    type: 'โรงแรมธีมรีสอร์ตระดับหรู',
    province: 'ชิบะ',
    starting_price: 45000,
    latitude: 35.6366,
    longitude: 139.8789,
    image_url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?q=80&w=1000',
    description: 'โรงแรมเรือธงระดับเวิลด์คลาสของโตเกียวดิสนีย์รีสอร์ต ตั้งอยู่ตรงข้ามประตูทางเข้าโตเกียวดิสนีย์แลนด์ ออกแบบด้วยสถาปัตยกรรมสไตล์วิคตอเรียนสุดอลังการ ภายในตกแต่งด้วยธีมตัวละครดิสนีย์ มีห้องพักธีมพิเศษ เช่น Beauty and the Beast, Cinderella และ Tinker Bell พร้อมสิทธิพิเศษ Happy Entry เข้าสวนสนุกก่อนเวลา / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 12:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1000',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1000',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000'
    ]
  },
  {
    name: 'Kamogawakan (คาโมกาวะคัง - Kamogawa)',
    type: 'ออนเซ็นเรียวกังริมทะเล',
    province: 'ชิบะ',
    starting_price: 32000,
    latitude: 35.1189,
    longitude: 140.1158,
    image_url: 'https://images.unsplash.com/photo-1445019980597-93fa8acb246c?q=80&w=1000',
    description: 'เรียวกังออนเซ็นระดับพรีเมียมริมชายฝั่งทะเลคาโมกาวะ แหลมโบโซ มีทั้งออนเซ็นแบบดั้งเดิมและสระออนเซ็นบนดาดฟ้า "HARUKA" ที่สามารถสวมชุดว่ายน้ำชมวิวทะเลแปซิฟิกกว้างไกลแบบอินฟินิตี้ ห้องพักตกแต่งสไตล์ญี่ปุ่นร่วมสมัย บริการอาหารไคเซกิซีฟู้ดสดใหม่จากทะเลท้องถิ่น / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 10:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1000',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000'
    ]
  },
  {
    name: 'Hotel Nikko Narita (โรงแรม นิกโกะ นาริตะ)',
    type: 'โรงแรมระดับพรีเมียมใกล้นามบิน',
    province: 'ชิบะ',
    starting_price: 12000,
    latitude: 35.7825,
    longitude: 140.3875,
    image_url: 'https://images.unsplash.com/photo-1596394516093-501ba68a0ba6?q=80&w=1000',
    description: 'โรงแรมชั้นนำในเครือนิกโก้ ใกล้สนามบินนานาชาตินาริตะ มีบริการรถบัสรับส่งฟรีตลอดทั้งวัน เหมาะสำหรับนักท่องเที่ยวที่ต้องการพักผ่อนอย่างสะดวกสบายก่อนหรือหลังเที่ยวบิน ห้องพักกว้างขวางเตียงนอนสบาย มีสวนหย่อมสไตล์ญี่ปุ่น สระว่ายน้ำกลางแจ้ง และห้องอาหารนานาชาติเซเรน่า / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 11:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1000',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=1000',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=1000',
      'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?q=80&w=1000'
    ]
  },

  // ==========================================
  // 4. ไซตามะ (Saitama) - 3 ที่พัก
  // ==========================================
  {
    name: 'Chichibu Onsen Miyamotsoso (ชิชิบุ ออนเซ็น มิยาโมโตะโซะ)',
    type: 'ออนเซ็นเรียวกังโบราณ',
    province: 'ไซตามะ',
    starting_price: 24000,
    latitude: 36.0358,
    longitude: 139.0622,
    image_url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?q=80&w=1000',
    description: 'เรียวกังโบราณอายุกว่า 200 ปีในเมืองชิชิบุ บริหารงานโดยอดีตนักมวยปล้ำซูโม่ชื่อดัง บรรยากาศบ้านไร่ชนบทดั้งเดิม ล้อมรอบด้วยธรรมชาติอันร่มรื่น ไฮไลท์คือหม้อไฟจังโกะนาเบะสูตรซูโม่ขนานแท้ ผักสดจากฟาร์ม และบ่อออนเซ็นกลางแจ้งหินธรรมชาติช่วยผ่อนคลายกล้ามเนื้อ / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 10:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000',
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?q=80&w=1000',
      'https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=1000',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1000'
    ]
  },
  {
    name: 'Kawagoe Tobu Hotel (คาวาโกเอะ โทบุ โฮเทล)',
    type: 'โรงแรมโมเดิร์นใจกลางเมือง',
    province: 'ไซตามะ',
    starting_price: 10500,
    latitude: 35.9069,
    longitude: 139.4828,
    image_url: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?q=80&w=1000',
    description: 'โรงแรมทันสมัยเชื่อมต่อโดยตรงกับทางเดินสถานีรถไฟคาวาโกเอะ (ทางออกทิศตะวันตก) เป็นจุดเริ่มต้นการเดินทางท่องเที่ยวเมืองเก่าโกดังโบราณคุระซึคุริที่สะดวกสบายที่สุด ห้องพักดีไซน์เรียบหรูสไตล์โมเดิร์นเจแปนนิส เตียงนอนคุณภาพสูง สิ่งอำนวยความสะดวกครบครัน / เวลาเช็คอิน: 14:00 น. | เวลาเช็คเอาท์: 11:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=1000',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000',
      'https://images.unsplash.com/photo-1506059612708-99d6c258160e?q=80&w=1000'
    ]
  },
  {
    name: 'Palace Hotel Omiya (พาเลซ โฮเทล โอมิยะ)',
    type: 'โรงแรมหรูใจกลางเมือง',
    province: 'ไซตามะ',
    starting_price: 15000,
    latitude: 35.9048,
    longitude: 139.6208,
    image_url: 'https://images.unsplash.com/photo-1586611292717-f828b167408c?q=80&w=1000',
    description: 'โรงแรมหรูระดับแลนด์มาร์กของจังหวัดไซตามะ ตั้งอยู่ติดกับสถานี JR Omiya ศูนย์กลางคมนาคมหลักของภูมิภาคคันโตตอนเหนือ ห้องพักขนาดใหญ่มาตรฐานโรงแรมพาเลซ มีห้องอาหารหลากหลายสไตล์ ฟิตเนส สระว่ายน้ำในร่ม และการเดินทางเชื่อมต่อกับชินคันเซ็นสะดวกสบาย / เวลาเช็คอิน: 14:00 น. | เวลาเช็คเอาท์: 11:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1000',
      'https://images.unsplash.com/photo-1587985064135-0366536eab42?q=80&w=1000',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000'
    ]
  },

  // ==========================================
  // 5. อิบารากิ (Ibaraki) - 3 ที่พัก
  // ==========================================
  {
    name: 'Oarai Hotel (โออาไร โฮเทล)',
    type: 'โรงแรมรีสอร์ตริมหาด',
    province: 'อิบารากิ',
    starting_price: 18500,
    latitude: 36.3155,
    longitude: 140.5878,
    image_url: 'https://images.unsplash.com/photo-1591088398332-8a7791972843?q=80&w=1000',
    description: 'โรงแรมรีสอร์ตริมชายหาดโออาไร ตั้งอยู่ตรงข้ามเสาโทริอิกลางโขดหินริมทะเลคามิอิโซะ (Kamiiso-no-Torii) ห้องพักชมวิวพระอาทิตย์ขึ้นเหนือมหาสมุทรแปซิฟิก มีบ่อออนเซ็นวิวทะเลแบบพาโนรามา จุดเด่นคือเมนูโชว์ชำแหละปลาอังโกะ (ปลาตกเบ็ด) และหม้อไฟอังโกะนาเบะชื่อดังประจำจังหวัดอิบารากิ / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 10:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1000',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1000',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000'
    ]
  },
  {
    name: 'Mito Plaza Hotel (มิโตะ พลาซ่า โฮเทล)',
    type: 'โรงแรมหรูคลาสสิก',
    province: 'อิบารากิ',
    starting_price: 16000,
    latitude: 36.3475,
    longitude: 140.4358,
    image_url: 'https://images.unsplash.com/photo-1507652313519-d4e9174996dd?q=80&w=1000',
    description: 'โรงแรมระดับพรีเมียมกลางผืนป่าอันเงียบสงบในเมืองมิโตะ ออกแบบโดยมัณฑนากรชื่อดังระดับโลก จอห์น เดวิด เอดิสัน ผสมผสานสถาปัตยกรรมยุโรปคลาสสิกกับศิลปะญี่ปุ่นอย่างหรูหราตระการตา โถงเอเทรียมกระจกโปร่งแสงขนาดใหญ่ ลานน้ำพุ และสวนสไตล์คอร์ทยาร์ด / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 11:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1000',
      'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000'
    ]
  },
  {
    name: 'Tsukuba Grand Hotel (สึคุบะ แกรนด์ โฮเทล - Mt. Tsukuba)',
    type: 'ออนเซ็นเรียวกังบนเขา',
    province: 'อิบารากิ',
    starting_price: 14000,
    latitude: 36.2167,
    longitude: 140.0989,
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000',
    description: 'โรงแรมออนเซ็นชื่อดังตั้งอยู่บนเชิงเขาซึคุบะ (Mount Tsukuba) วิวทิวทัศน์มุมกว้างมองเห็นที่ราบคันโตและแสงไฟระยิบระยับของเมืองยามค่ำคืน มีบ่อออนเซ็นกลางแจ้งและบ่อหินธรรมชาติที่มีแร่ธาตุบำรุงผิวพรรณ อาหารค่ำแบบไคเซกิปรุงด้วยวัตถุดิบท้องถิ่นของเทือกเขาฮิตาจิ / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 10:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?q=80&w=1000',
      'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?q=80&w=1000',
      'https://images.unsplash.com/photo-1613545325278-f24b0cae1224?q=80&w=1000',
      'https://images.unsplash.com/photo-1584132915807-fd1f5fbc078f?q=80&w=1000'
    ]
  },

  // ==========================================
  // 6. โทจิงิ (Tochigi) - 3 ที่พัก
  // ==========================================
  {
    name: 'Nikko Kanaya Hotel (นิกโกะ คานายะ โฮเทล)',
    type: 'โรงแรมประวัติศาสตร์ระดับคลาสสิก',
    province: 'โทจิงิ',
    starting_price: 28000,
    latitude: 36.7516,
    longitude: 139.6052,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
    description: 'โรงแรมรีสอร์ตสไตล์ตะวันตกที่เก่าแก่ที่สุดในญี่ปุ่น ก่อตั้งในปี ค.ศ. 1873 ตั้งอยู่ใกล้กับสะพานชินเคียวและศาลเจ้านิกโกะโทโชกู สถาปัตยกรรมไม้คลาสสิกงดงามผสมผสานศิลปะประติมากรรมแบบดั้งเดิมของนิกโก้ เคยต้อนรับบุคคลสำคัญระดับโลกอย่างอัลเบิร์ต ไอน์สไตน์ และเฮเลน เคลเลอร์ / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 11:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=1000',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000'
    ]
  },
  {
    name: 'Asaya Hotel Kinugawa Onsen (โรงแรม อาซายะ คินุกาวะ ออนเซ็น)',
    type: 'ออนเซ็นรีสอร์ตหรูขนาดใหญ่',
    province: 'โทจิงิ',
    starting_price: 35000,
    latitude: 36.8364,
    longitude: 139.7198,
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?q=80&w=1000',
    description: 'ออนเซ็นเรียวกังระดับตำนานอายุกว่า 130 ปี ริมหุบเขาคินุกาวะ โดดเด่นด้วยโถงกลางอาคารสูงโปร่ง 8 ชั้นพร้อมลิฟต์แก้วสวยงาม บ่อออนเซ็นกลางแจ้งบนชั้นดาดฟ้าลอยฟ้า (Shojo Open-air Bath) ชมวิวหุบเขาและดวงดาว บุฟเฟต์อาหารค่ำและเช้ามากกว่า 100 ชนิดที่ได้รับรางวัลอันดับ 1 ของญี่ปุ่น / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 10:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=1000',
      'https://images.unsplash.com/photo-1563911302283-d2bc129e7570?q=80&w=1000',
      'https://images.unsplash.com/photo-1549294413-26f195200c16?q=80&w=1000',
      'https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=1000'
    ]
  },
  {
    name: 'Hoshino Resorts RISONARE Nasu (โฮชิโนะ รีสอร์ท ริโซนาเร นาสุ)',
    type: 'อะกริทัวริสม์รีสอร์ตหรู',
    province: 'โทจิงิ',
    starting_price: 46000,
    latitude: 37.0398,
    longitude: 140.0132,
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1000',
    description: 'รีสอร์ตเชิงเกษตรและธรรมชาติระดับพรีเมียมในเครือโฮชิโนะ ตั้งอยู่ท่ามกลางป่าเขาและทุ่งหญ้าเขียวขจีของที่ราบสูงนาสุ มีฟาร์มเกษตรอินทรีย์ให้ร่วมเก็บเกี่ยวผักสด กิจกรรมเชิงนิเวศน์ ออนเซ็นกลางแจ้ง และห้องอาหารอิตาเลียน "OTTO SETTE NASU" ที่ใช้วัตถุดิบสดใหม่จากฟาร์ม / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 12:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?q=80&w=1000',
      'https://images.unsplash.com/photo-1561501900-3701fa6a0864?q=80&w=1000',
      'https://images.unsplash.com/photo-1540555700478-4be289fbecef?q=80&w=1000',
      'https://images.unsplash.com/photo-1506059612708-99d6c258160e?q=80&w=1000'
    ]
  },

  // ==========================================
  // 7. กุนมะ (Gunma) - 3 ที่พัก
  // ==========================================
  {
    name: 'Kusatsu Onsen Hotel Ichii (คุซัทสึ ออนเซ็น โฮเทล อิจิอิ)',
    type: 'ออนเซ็นเรียวกังระดับประวัติศาสตร์',
    province: 'กุนมะ',
    starting_price: 26000,
    latitude: 36.6228,
    longitude: 138.5968,
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?q=80&w=1000',
    description: 'เรียวกังประวัติศาสตร์อายุกว่า 300 ปี ตั้งอยู่ติดกับทุ่งน้ำพุร้อน "ยูบาตาเกะ" (Yubatake) สัญลักษณ์ใจกลางเมืองคุซัทสึออนเซ็น ห้องพักฝั่งยูบาตาเกะสามารถมองเห็นควันไอร้อนและแสงไฟประดับยามค่ำคืนได้อย่างใกล้ชิด มีบ่อออนเซ็น 2 แหล่งน้ำแร่บริสุทธิ์ 100% จากธรรมชาติ / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 10:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1000',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000',
      'https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1000',
      'https://images.unsplash.com/photo-1595576508898-0ad5c879a061?q=80&w=1000'
    ]
  },
  {
    name: 'Ouan Ikaho Onsen (โออัน อิคาโฮะ ออนเซ็น - Kaiki no Yu Ouan)',
    type: 'ออนเซ็นเรียวกังหรูแบบดั้งเดิม',
    province: 'กุนมะ',
    starting_price: 30000,
    latitude: 36.4975,
    longitude: 138.9189,
    image_url: 'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?q=80&w=1000',
    description: 'เรียวกังไม้โบราณสไตล์ญี่ปุ่นแท้ที่สร้างขึ้นด้วยไม้ฮิโนกิและไม้มีค่าทั้งหลัง ตั้งอยู่ใกล้บันไดหิน 365 ขั้นของอิคาโฮะออนเซ็น โดดเด่นด้วยบ่อน้ำพุร้อนสีทอง "โคงาเนะ โนะ ยุ" (Kogane no Yu) อันโด่งดังที่อุดมด้วยธาตุเหล็ก บรรยากาศเงียบสงบ ผ่อนคลาย และอาหารไคเซกิเนื้อวัวโจชูรสเลิศ / เวลาเช็คอิน: 15:00 น. | เวลาเช็คเอาท์: 10:30 น.',
    gallery: [
      'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?q=80&w=1000',
      'https://images.unsplash.com/photo-1587985064135-0366536eab42?q=80&w=1000',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?q=80&w=1000',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?q=80&w=1000'
    ]
  },
  {
    name: 'Takaragawa Onsen Osenkaku (ทาคาระงาวะ ออนเซ็น โอเซนคาคุ - Minakami)',
    type: 'ออนเซ็นเรียวกังกลางป่าริมลำธาร',
    province: 'กุนมะ',
    starting_price: 25000,
    latitude: 36.8452,
    longitude: 139.0526,
    image_url: 'https://images.unsplash.com/photo-1568495248636-6432b97bd949?q=80&w=1000',
    description: 'เรียวกังออนเซ็นริมลำธารทาคาระงาวะอันเลื่องชื่อระดับโลกในเมืองมินาคามิ มีบ่อออนเซ็นกลางแจ้งริมแม่น้ำขนาดใหญ่ยักษ์ 4 บ่อ ล้อมรอบด้วยธรรมชาติ ป่าไม้ และสายน้ำไหลผ่าน สวยงามจับตาในทุกฤดูกาล ทั้งใบไม้ผลิ ใบไม้เปลี่ยนสี และหิมะขาวโพลนในฤดูหนาว / เวลาเช็คอิน: 14:00 น. | เวลาเช็คเอาท์: 10:00 น.',
    gallery: [
      'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1000',
      'https://images.unsplash.com/photo-1564501049412-61c2a3083791?q=80&w=1000',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?q=80&w=1000',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?q=80&w=1000'
    ]
  }
];

async function seedAccommodations() {
  const conn = await pool.getConnection();
  try {
    console.log('Starting accommodation seed for all 7 provinces (3 accommodations each = 21 accommodations)...');

    for (const acc of allAccommodations) {
      // Check if accommodation already exists by exact name
      const [existing] = await conn.query(
        'SELECT accommodation_id FROM accommodations WHERE name = ?',
        [acc.name]
      );

      let accId;
      if (existing.length > 0) {
        accId = existing[0].accommodation_id;
        await conn.query(
          'UPDATE accommodations SET name=?, type=?, description=?, province=?, starting_price=?, latitude=?, longitude=?, image_url=? WHERE accommodation_id=?',
          [acc.name, acc.type, acc.description, acc.province, acc.starting_price, acc.latitude, acc.longitude, acc.image_url, accId]
        );
        console.log(`[UPDATE] (${acc.province}) ${acc.name} (ID: ${accId})`);
      } else {
        const [res] = await conn.query(
          'INSERT INTO accommodations (name, type, description, province, starting_price, latitude, longitude, image_url, view_count) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0)',
          [acc.name, acc.type, acc.description, acc.province, acc.starting_price, acc.latitude, acc.longitude, acc.image_url]
        );
        accId = res.insertId;
        console.log(`[INSERT] (${acc.province}) ${acc.name} (ID: ${accId})`);
      }

      // Update gallery images (ensuring > 3 images, exactly 4 images per accommodation)
      await conn.query('DELETE FROM accommodation_images WHERE accommodation_id = ?', [accId]);
      for (const imgUrl of acc.gallery) {
        await conn.query(
          'INSERT INTO accommodation_images (accommodation_id, file_name) VALUES (?, ?)',
          [accId, imgUrl]
        );
      }
    }

    console.log('--- Finished seeding accommodations! ---');
  } catch (err) {
    console.error('Error seeding accommodations:', err);
    throw err;
  } finally {
    conn.release();
    process.exit(0);
  }
}

seedAccommodations().catch((err) => {
  console.error(err);
  process.exit(1);
});
