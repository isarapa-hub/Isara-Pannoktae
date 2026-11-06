-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 07, 2026 at 06:26 AM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `project_jp`
--

-- --------------------------------------------------------

--
-- Table structure for table `accommodations`
--

CREATE TABLE `accommodations` (
  `accommodation_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `province` varchar(100) DEFAULT 'โตเกียว',
  `starting_price` decimal(10,2) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `image_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `accommodations`
--

INSERT INTO `accommodations` (`accommodation_id`, `name`, `type`, `description`, `province`, `starting_price`, `latitude`, `longitude`, `image_url`) VALUES
(1, 'Palace Hotel Tokyo', 'โรงแรม', 'โตเกียวมีโรงแรมหรูติดอันดับโลกอยู่เป็นจำนวนมากและทุกที่ต่างก็มีข้อดีเป็นของตัวเอง โรงแรมที่เราอยากแนะนำเป็นพิเศษ คือ Palace Hotel Tokyo', 'โตเกียว', 0.00, NULL, NULL, 'https://d1vqr0cheeo2qs.cloudfront.net/images/imgs/000/069/455/original/39483297.jpg?1631687119&d=750x750');

-- --------------------------------------------------------

--
-- Table structure for table `accommodation_images`
--

CREATE TABLE `accommodation_images` (
  `image_id` int(11) NOT NULL,
  `accommodation_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attractions`
--

CREATE TABLE `attractions` (
  `attraction_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `starting_price` decimal(10,2) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `image_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attractions`
--

INSERT INTO `attractions` (`attraction_id`, `name`, `description`, `province`, `open_time`, `close_time`, `starting_price`, `latitude`, `longitude`, `image_url`) VALUES
(1, 'วัดเซนโซจิ', 'วัดเซ็นโซจิ (Sensoji Temple) วัดที่มีประตูและโคมแดงขนาดยักษ์โดดเด่น เป็นจุดถ่ายรูปห้ามพลาดของคนที่มาเที่ยวย่านอาซากุสะของโตเกียว คนเลยเรียกกันจนติดปากว่าวัดอาซากุสะ แถมตัวอักษรคันจิของชื่อวัดก็เป็นตัวเดียวกันกับชื่อย่านอาซากุสะแต่อ่านออกเสียงต่างกัน จะมีคนเข้าใจผิดก็คงไม่แปลกค่ะ\n\nด้วยความกว้างขวางของที่นี่ ทำให้คนที่มาหลายคนเที่ยวที่นี่ได้ไม่ครบทุกซอกทุกมุม วันนี้เลยจะขอมาแนะนำเส้นทางการเดินชมวัดเซ็นโซจิแบบเน้นๆ กันเลย สำหรับคนที่อยากจะเก็บทุกกระเบียดนิ้วของวัดเซ็นโซจิโดยเฉพาะ', 'โตเกียว', '00:15:00', '03:15:00', 0.00, NULL, NULL, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRSuHwKM7dRaMvgiLjUp-f5-_3I4cz2K9L8PoeZIsbGQKJveMIaQ64pwW0W&s=10');

-- --------------------------------------------------------

--
-- Table structure for table `attraction_images`
--

CREATE TABLE `attraction_images` (
  `image_id` int(11) NOT NULL,
  `attraction_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `favorites`
--

CREATE TABLE `favorites` (
  `favorite_id` int(11) NOT NULL,
  `member_id` int(11) NOT NULL,
  `accommodation_id` int(11) DEFAULT NULL,
  `restaurant_id` int(11) DEFAULT NULL,
  `attraction_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `favorites`
--

INSERT INTO `favorites` (`favorite_id`, `member_id`, `accommodation_id`, `restaurant_id`, `attraction_id`) VALUES
(18, 5, NULL, NULL, 1);

-- --------------------------------------------------------

--
-- Table structure for table `members`
--

CREATE TABLE `members` (
  `member_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` enum('user','admin') DEFAULT 'user',
  `google_id` varchar(255) DEFAULT NULL,
  `profile_picture` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `members`
--

INSERT INTO `members` (`member_id`, `name`, `email`, `password`, `role`, `google_id`, `profile_picture`) VALUES
(4, 'Admin', 'admin@gmail.com', '$2b$10$hyIYsAzufw0id7o1O6rume/qhcPlITTojVN2yON80TT4.L9TeHs6m', 'admin', NULL, NULL),
(5, 'Isara', 'isara.pa@ku.th', '$2b$10$QK8plUBuon/QVjj868wI.uhpgfEdpHo/qw74MIqpRWcCGQglC.quO', 'user', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `plan_details`
--

CREATE TABLE `plan_details` (
  `detail_id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `attraction_id` int(11) DEFAULT NULL,
  `restaurant_id` int(11) DEFAULT NULL,
  `accommodation_id` int(11) DEFAULT NULL,
  `day_sequence` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `restaurants`
--

CREATE TABLE `restaurants` (
  `restaurant_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `province` varchar(100) DEFAULT NULL,
  `open_time` time DEFAULT NULL,
  `close_time` time DEFAULT NULL,
  `starting_price` decimal(10,2) DEFAULT NULL,
  `latitude` double DEFAULT NULL,
  `longitude` double DEFAULT NULL,
  `image_url` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `restaurants`
--

INSERT INTO `restaurants` (`restaurant_id`, `name`, `description`, `province`, `open_time`, `close_time`, `starting_price`, `latitude`, `longitude`, `image_url`) VALUES
(1, 'Sushimasa Omiya-Station East Entrance', 'คุณสามารถเพลิดเพลินกับมื้ออาหารอย่างช้าๆ ในบรรยากาศที่เงียบสงบสไตล์ญี่ปุ่น เรามีราเมนให้เลือก 4 แบบ รวมถึงโซบะแบบจีนดั้งเดิม ขิง เกลือ และสาหร่ายคอมบุ แต่ละแบบมีรสชาติที่เป็นเอกลักษณ์ โซบะแบบจีนมีชาชูให้เลือก 2 แบบ คือทำจากไก่และหมู และคุณสามารถเพิ่มความเข้มข้นของน้ำซุปด้วยปลาแห้งที่วางไว้บนโต๊ะทุกโต๊ะ ที่นี่เป็นสถานที่ที่คุณอยากมาเยือนโดยเฉพาะเพื่อลิ้มลองอาหาร เราจึงไม่เพียงแต่มีอาหารคุณภาพสูงเท่านั้น แต่ยังมีบรรยากาศที่หรูหราและบริการที่เป็นเลิศอีกด้วย', 'ไซตามะ', '11:30:00', '15:00:00', 950.00, NULL, NULL, 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/04/74/a9/f7/caption.jpg?w=1000&h=-1&s=1');

-- --------------------------------------------------------

--
-- Table structure for table `restaurant_images`
--

CREATE TABLE `restaurant_images` (
  `image_id` int(11) NOT NULL,
  `restaurant_id` int(11) DEFAULT NULL,
  `file_name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `travel_plans`
--

CREATE TABLE `travel_plans` (
  `plan_id` int(11) NOT NULL,
  `member_id` int(11) DEFAULT NULL,
  `plan_name` varchar(255) NOT NULL,
  `start_date` date DEFAULT NULL,
  `end_date` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `accommodations`
--
ALTER TABLE `accommodations`
  ADD PRIMARY KEY (`accommodation_id`);

--
-- Indexes for table `accommodation_images`
--
ALTER TABLE `accommodation_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `accommodation_id` (`accommodation_id`);

--
-- Indexes for table `attractions`
--
ALTER TABLE `attractions`
  ADD PRIMARY KEY (`attraction_id`);

--
-- Indexes for table `attraction_images`
--
ALTER TABLE `attraction_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `attraction_id` (`attraction_id`);

--
-- Indexes for table `favorites`
--
ALTER TABLE `favorites`
  ADD PRIMARY KEY (`favorite_id`),
  ADD KEY `member_id` (`member_id`),
  ADD KEY `accommodation_id` (`accommodation_id`),
  ADD KEY `restaurant_id` (`restaurant_id`),
  ADD KEY `attraction_id` (`attraction_id`);

--
-- Indexes for table `members`
--
ALTER TABLE `members`
  ADD PRIMARY KEY (`member_id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `plan_details`
--
ALTER TABLE `plan_details`
  ADD PRIMARY KEY (`detail_id`),
  ADD KEY `plan_id` (`plan_id`),
  ADD KEY `attraction_id` (`attraction_id`),
  ADD KEY `restaurant_id` (`restaurant_id`),
  ADD KEY `accommodation_id` (`accommodation_id`);

--
-- Indexes for table `restaurants`
--
ALTER TABLE `restaurants`
  ADD PRIMARY KEY (`restaurant_id`);

--
-- Indexes for table `restaurant_images`
--
ALTER TABLE `restaurant_images`
  ADD PRIMARY KEY (`image_id`),
  ADD KEY `restaurant_id` (`restaurant_id`);

--
-- Indexes for table `travel_plans`
--
ALTER TABLE `travel_plans`
  ADD PRIMARY KEY (`plan_id`),
  ADD KEY `member_id` (`member_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `accommodations`
--
ALTER TABLE `accommodations`
  MODIFY `accommodation_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `accommodation_images`
--
ALTER TABLE `accommodation_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attractions`
--
ALTER TABLE `attractions`
  MODIFY `attraction_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `attraction_images`
--
ALTER TABLE `attraction_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `favorites`
--
ALTER TABLE `favorites`
  MODIFY `favorite_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=23;

--
-- AUTO_INCREMENT for table `members`
--
ALTER TABLE `members`
  MODIFY `member_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `plan_details`
--
ALTER TABLE `plan_details`
  MODIFY `detail_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `restaurants`
--
ALTER TABLE `restaurants`
  MODIFY `restaurant_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `restaurant_images`
--
ALTER TABLE `restaurant_images`
  MODIFY `image_id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `travel_plans`
--
ALTER TABLE `travel_plans`
  MODIFY `plan_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `accommodation_images`
--
ALTER TABLE `accommodation_images`
  ADD CONSTRAINT `accommodation_images_ibfk_1` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`accommodation_id`) ON DELETE CASCADE;

--
-- Constraints for table `attraction_images`
--
ALTER TABLE `attraction_images`
  ADD CONSTRAINT `attraction_images_ibfk_1` FOREIGN KEY (`attraction_id`) REFERENCES `attractions` (`attraction_id`) ON DELETE CASCADE;

--
-- Constraints for table `favorites`
--
ALTER TABLE `favorites`
  ADD CONSTRAINT `favorites_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_2` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`accommodation_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_3` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `favorites_ibfk_4` FOREIGN KEY (`attraction_id`) REFERENCES `attractions` (`attraction_id`) ON DELETE CASCADE;

--
-- Constraints for table `plan_details`
--
ALTER TABLE `plan_details`
  ADD CONSTRAINT `plan_details_ibfk_1` FOREIGN KEY (`plan_id`) REFERENCES `travel_plans` (`plan_id`) ON DELETE CASCADE,
  ADD CONSTRAINT `plan_details_ibfk_2` FOREIGN KEY (`attraction_id`) REFERENCES `attractions` (`attraction_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `plan_details_ibfk_3` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE SET NULL,
  ADD CONSTRAINT `plan_details_ibfk_4` FOREIGN KEY (`accommodation_id`) REFERENCES `accommodations` (`accommodation_id`) ON DELETE SET NULL;

--
-- Constraints for table `restaurant_images`
--
ALTER TABLE `restaurant_images`
  ADD CONSTRAINT `restaurant_images_ibfk_1` FOREIGN KEY (`restaurant_id`) REFERENCES `restaurants` (`restaurant_id`) ON DELETE CASCADE;

--
-- Constraints for table `travel_plans`
--
ALTER TABLE `travel_plans`
  ADD CONSTRAINT `travel_plans_ibfk_1` FOREIGN KEY (`member_id`) REFERENCES `members` (`member_id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
