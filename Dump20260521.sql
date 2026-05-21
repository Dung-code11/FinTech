-- MySQL dump 10.13  Distrib 8.0.42, for Win64 (x86_64)
--
-- Host: 127.0.0.1    Database: fintech
-- ------------------------------------------------------
-- Server version	8.4.8

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `account`
--

DROP TABLE IF EXISTS `account`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `account` (
  `id` varchar(255) NOT NULL,
  `username` varchar(255) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` enum('USER','ADMIN') DEFAULT 'USER',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `is_actived` tinyint(1) DEFAULT '1',
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `account`
--

LOCK TABLES `account` WRITE;
/*!40000 ALTER TABLE `account` DISABLE KEYS */;
INSERT INTO `account` VALUES ('1c5634ed-0068-4b63-b3d5-fbfd29f60e2d','user4','$2a$10$SQf3DBdJphCqtsvOgeKYpOu3xJNC/hKswf9BhgpFx8IQdzkUNCEDO','USER','2026-03-23 09:17:11','2026-05-12 13:39:28',1),('6d7a366b-256f-415c-b8ec-029d738fd2a5','admin1','$2a$10$d6C2tffh66dywOb4btYRIOuwpG2PrbZ7BprrcMm59aHTEWp24Z92y','USER','2026-03-09 04:12:59','2026-03-11 09:45:25',1),('82773c58-e7a1-4e73-bf2f-1e2ee78dbee6','user2','$2a$10$A7YO0RdIfBvl2JOAAnawhu4cIxLi8pHoHxPZunuLPsD2A.jW.fn8C','ADMIN','2026-03-09 09:35:22','2026-04-06 02:11:59',1),('a2ea3c07-bf48-4181-b45d-9ab227113701','user3','$2a$10$FcIrDlo8E84M5ZLSaiRjmOg9s88A4GqYB.ctlhFY1RvJnxC2rMFeS','USER','2026-03-11 10:12:30','2026-03-11 10:14:34',1),('Admin1103','admin','$2a$10$Dow1u8kJ0uIK4WMbeqPfUO3u5dUvNbzH.j9Yx8RJWb1x1oGf4bm/a','ADMIN','2026-03-09 04:16:01','2026-03-09 04:16:01',1),('d020d8f9-4228-4290-b59a-53abb7ead687','user1','$2a$10$QN7o1fV81HSPyNXp2d81WuL3WAo5HuxGToV0wHxdOqAvRugp3JwRO','USER','2026-03-09 09:31:00','2026-03-09 09:31:00',1);
/*!40000 ALTER TABLE `account` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budget_categories`
--

DROP TABLE IF EXISTS `budget_categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budget_categories` (
  `budget_id` varchar(255) NOT NULL,
  `category_id` varchar(255) NOT NULL,
  PRIMARY KEY (`budget_id`,`category_id`),
  KEY `fk_bc_category` (`category_id`),
  CONSTRAINT `fk_bc_budget` FOREIGN KEY (`budget_id`) REFERENCES `budgets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_bc_category` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budget_categories`
--

LOCK TABLES `budget_categories` WRITE;
/*!40000 ALTER TABLE `budget_categories` DISABLE KEYS */;
/*!40000 ALTER TABLE `budget_categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `budgets`
--

DROP TABLE IF EXISTS `budgets`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `budgets` (
  `id` varchar(255) NOT NULL,
  `budget_name` varchar(255) NOT NULL,
  `type` enum('EXPENSE','INCOME') NOT NULL,
  `amount` double NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `period` enum('DAILY','WEEKLY','MONTHLY') DEFAULT 'MONTHLY',
  `wallet_id` varchar(255) NOT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `name` varchar(255) DEFAULT NULL,
  `spent` double NOT NULL,
  PRIMARY KEY (`id`),
  KEY `fk_budget_wallet` (`wallet_id`),
  CONSTRAINT `fk_budget_wallet` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `budgets`
--

LOCK TABLES `budgets` WRITE;
/*!40000 ALTER TABLE `budgets` DISABLE KEYS */;
INSERT INTO `budgets` VALUES ('800ff42f-8233-4b40-bc13-89cae3674356','Tiết kiệm mua xe','INCOME',2000000,'2026-03-26','2026-04-26','MONTHLY','3ac4a922-7567-469d-af30-f346e0f2a7ba','2026-03-26 01:10:55','2026-03-26 01:10:55',NULL,0),('d901bae8-1055-4d9d-b04f-e54ec99be2cf','Tiền ăn','EXPENSE',200000,'2026-03-25','2026-04-25','MONTHLY','3ac4a922-7567-469d-af30-f346e0f2a7ba','2026-03-25 10:37:11','2026-03-25 10:37:11',NULL,0);
/*!40000 ALTER TABLE `budgets` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` varchar(255) NOT NULL,
  `category_name` varchar(255) NOT NULL,
  `type` enum('INCOME','EXPENSE') NOT NULL,
  `owner_id` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `category_ibfk_1` FOREIGN KEY (`owner_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES ('04b190d5-257f-4705-9f7f-244a76877b7e','Trả nợ','EXPENSE','82773c58-e7a1-4e73-bf2f-1e2ee78dbee6',0),('6670484d-17f1-4850-9692-96edd4761c87','Thu nhập','INCOME',NULL,1),('7cbdf62c-f456-424e-b9fa-a5b1c9c6569f','Khác','EXPENSE',NULL,0),('aab4dc2e-6699-49f3-a262-695a6623e7bf','Ăn uống','EXPENSE',NULL,1),('c5d19e60-23d8-11f1-a81c-00155dd601e4','Thức ăn và Đồ uống','EXPENSE',NULL,1),('c5d6015a-23d8-11f1-a81c-00155dd601e4','Di chuyển','EXPENSE',NULL,1),('c5d616ed-23d8-11f1-a81c-00155dd601e4','Giải trí','EXPENSE',NULL,1),('c5d61906-23d8-11f1-a81c-00155dd601e4','Lương','INCOME',NULL,1),('c5d619d3-23d8-11f1-a81c-00155dd601e4','Thưởng','INCOME',NULL,1),('c5d61aa5-23d8-11f1-a81c-00155dd601e4','Đầu tư crypto','INCOME','82773c58-e7a1-4e73-bf2f-1e2ee78dbee6',0),('c5d6464a-23d8-11f1-a81c-00155dd601e4','Mua sắm online','EXPENSE','82773c58-e7a1-4e73-bf2f-1e2ee78dbee6',0);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `debt`
--

DROP TABLE IF EXISTS `debt`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debt` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `total_amount` decimal(38,2) DEFAULT NULL,
  `remaining_amount` decimal(38,2) DEFAULT NULL,
  `created_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `target_date` date DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `wallet_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `wallet_id` (`wallet_id`),
  CONSTRAINT `debt_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `debt`
--

LOCK TABLES `debt` WRITE;
/*!40000 ALTER TABLE `debt` DISABLE KEYS */;
INSERT INTO `debt` VALUES (3,'Vay Xe',NULL,200000.00,112000.00,'2026-03-27 17:22:31','2026-04-26',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(4,'Vay Xe',NULL,200000.00,100000.00,'2026-03-27 17:22:31','2026-04-26',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(5,'test nợ ',NULL,3000000.00,0.00,'2026-03-30 08:58:11','2026-04-29',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(6,'test nợ ',NULL,3000000.00,3000000.00,'2026-03-30 08:58:11','2026-04-29',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(7,'test nợ 2','VND',3000000.00,0.00,'2026-03-30 09:26:27','2026-04-29',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(8,'test nợ 2','VND',3000000.00,3000000.00,'2026-03-30 09:26:27','2026-04-29',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d');
/*!40000 ALTER TABLE `debt` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `debt_payment`
--

DROP TABLE IF EXISTS `debt_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `debt_payment` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `debt_id` bigint NOT NULL,
  `title` varchar(255) DEFAULT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `payment_date` datetime DEFAULT CURRENT_TIMESTAMP,
  `note` varchar(255) DEFAULT NULL,
  `wallet_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `debt_id` (`debt_id`),
  KEY `wallet_id` (`wallet_id`),
  CONSTRAINT `debt_payment_ibfk_1` FOREIGN KEY (`debt_id`) REFERENCES `debt` (`id`) ON DELETE CASCADE,
  CONSTRAINT `debt_payment_ibfk_2` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `debt_payment`
--

LOCK TABLES `debt_payment` WRITE;
/*!40000 ALTER TABLE `debt_payment` DISABLE KEYS */;
INSERT INTO `debt_payment` VALUES (1,4,NULL,20000.00,'2026-03-27 17:35:23',NULL,'3ac4a922-7567-469d-af30-f346e0f2a7ba'),(2,4,NULL,20000.00,'2026-03-27 17:35:51',NULL,'3ac4a922-7567-469d-af30-f346e0f2a7ba'),(3,3,NULL,20000.00,'2026-03-30 08:33:11',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(4,3,NULL,19000.00,'2026-03-30 08:37:38',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(5,3,NULL,29000.00,'2026-03-30 08:48:47',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(6,3,NULL,20000.00,'2026-03-30 08:56:37',NULL,'3ac4a922-7567-469d-af30-f346e0f2a7ba'),(7,5,NULL,2000000.00,'2026-03-30 08:58:43',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(8,5,NULL,1000000.00,'2026-03-30 08:59:10',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(9,7,'Trả nợ test nợ 2',2000000.00,'2026-03-30 09:26:47',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(10,7,'Trả nợ test nợ 2',1000000.00,'2026-03-30 09:41:16',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(11,4,'Trả nợ Vay Xe',60000.00,'2026-03-30 10:56:15',NULL,'3fe093ec-5a01-4d70-aebe-54cc47ada21d');
/*!40000 ALTER TABLE `debt_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `info_user`
--

DROP TABLE IF EXISTS `info_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `info_user` (
  `id` varchar(255) NOT NULL,
  `fullname` varchar(255) DEFAULT NULL,
  `birthday` date DEFAULT NULL,
  `sex` enum('NAM','NU') DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `account_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKn0ar0dbot8eqeo5scla9tn7ie` (`account_id`),
  CONSTRAINT `FK5ymay5c81cp14po6ipf2ib056` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `info_user`
--

LOCK TABLES `info_user` WRITE;
/*!40000 ALTER TABLE `info_user` DISABLE KEYS */;
INSERT INTO `info_user` VALUES ('377c4474-80cb-4e02-ae53-e11e3daacabc','Lê Tiến Dũng','2004-05-29','NAM','Hà Nội','dungwar204@gmail.com','0865841556','2026-03-09 04:12:59','2026-03-09 04:12:59','6d7a366b-256f-415c-b8ec-029d738fd2a5'),('976a988c-71e5-4d21-bfcf-d612089bdc40','Nguyễn Văn B','2004-05-25','NAM','Hà Nội','bnguyenvan@gmail.com','0865841558','2026-03-09 09:35:22','2026-03-09 09:35:22','82773c58-e7a1-4e73-bf2f-1e2ee78dbee6'),('c5c48cb6-7c06-4af6-ae0a-80995833a0d1','Nguyễn Văn A','2004-05-25','NAM','Nghệ An','anguyenvan@gmail.com','0865841557','2026-03-09 09:31:01','2026-03-09 09:31:01','d020d8f9-4228-4290-b59a-53abb7ead687'),('dc6a3c4c-9d1f-47ee-8fee-b9bdffce16af','Nguyễn Văn C','2004-05-29','NAM','Nghệ An','kaynsaki@mailinator.com','0865841560','2026-03-11 10:12:30','2026-03-11 10:12:30','a2ea3c07-bf48-4181-b45d-9ab227113701'),('f5856828-0541-44ba-8bb9-559ec54e4094','Mã Tiến An','2004-05-29','NAM','Hà Nội','kaioken@mailinator.com','0865841686','2026-03-23 09:17:11','2026-03-23 09:17:11','1c5634ed-0068-4b63-b3d5-fbfd29f60e2d'),('f9ab62af-1b6e-11f1-901a-0a0027000006','Lê Tiến Dũng','2004-05-29','NAM','Hà Nội','dungmlee12@gmail.com','0865841556','2026-03-09 04:18:07','2026-03-09 04:18:07','Admin1103');
/*!40000 ALTER TABLE `info_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `password_reset_otp`
--

DROP TABLE IF EXISTS `password_reset_otp`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `password_reset_otp` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(255) DEFAULT NULL,
  `otp` varchar(10) DEFAULT NULL,
  `expiry_time` timestamp NULL DEFAULT NULL,
  `used` tinyint(1) DEFAULT '0',
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `otp_hash` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `password_reset_otp`
--

LOCK TABLES `password_reset_otp` WRITE;
/*!40000 ALTER TABLE `password_reset_otp` DISABLE KEYS */;
INSERT INTO `password_reset_otp` VALUES (1,'dungwar204@gmail.com',NULL,'2026-03-10 08:06:25',1,'2026-03-10 08:01:25','b7c6eb641f734ed7c5efe8e7179419c443bbf711914f21c881fff1517f7d00ee'),(2,'dungwar204@gmail.com',NULL,'2026-03-10 08:17:29',1,'2026-03-10 08:12:29','60b9270fcfbaa7299131156ad1983ae584ea95da0bf2f2a850fa7880e09d1edb'),(3,'dungwar204@gmail.com',NULL,'2026-03-10 08:44:54',1,'2026-03-10 08:39:54','95fef99e2f54966eaf71cbfa9d7e90dfcdcfc40fea8339ee965a5e893f1b98d2'),(4,'dungwar204@gmail.com',NULL,'2026-03-11 09:28:01',1,'2026-03-11 09:23:01','e2392ab9e774946de262675a888b56f35b69cb9135f78ddf7ca4098b7e2aac5c'),(5,'dungwar204@gmail.com',NULL,'2026-03-11 09:49:18',1,'2026-03-11 09:44:18','30db31adaacbbb806081799c53ea78012ae9e00fa048fb4771959bba5ce18fa4'),(6,'kaynsaki@mailinator.com',NULL,'2026-03-11 10:18:53',1,'2026-03-11 10:13:53','2fa0bcdfee3f9e148421c2ad3c660d554f61d05c5124c61c3c12d1c80735ae1c'),(7,'kaioken@mailinator.com',NULL,'2026-04-24 08:37:11',1,'2026-04-24 08:32:11','dab6cc8eaa4043b285e42f1f6d7e99202d2824239ba280ed917b1afadb57e52c');
/*!40000 ALTER TABLE `password_reset_otp` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saving_transactions`
--

DROP TABLE IF EXISTS `saving_transactions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saving_transactions` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `amount` decimal(38,2) DEFAULT NULL,
  `note` varchar(255) DEFAULT NULL,
  `transaction_date` datetime(6) DEFAULT NULL,
  `saving_id` varchar(255) DEFAULT NULL,
  `wallet_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKiocvvanyg01th3gt8s1a4ehsw` (`saving_id`),
  KEY `FKthsn8i8k11lo6ngxbvuvumcxj` (`wallet_id`),
  CONSTRAINT `FKiocvvanyg01th3gt8s1a4ehsw` FOREIGN KEY (`saving_id`) REFERENCES `savings` (`id`),
  CONSTRAINT `FKthsn8i8k11lo6ngxbvuvumcxj` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saving_transactions`
--

LOCK TABLES `saving_transactions` WRITE;
/*!40000 ALTER TABLE `saving_transactions` DISABLE KEYS */;
INSERT INTO `saving_transactions` VALUES (1,20000.00,'','2026-03-31 03:47:33.650000','96c6a129-784c-4db9-a040-3578a062dbd9','3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(2,-20000.00,'Rút: ','2026-03-31 10:47:47.039719','96c6a129-784c-4db9-a040-3578a062dbd9','3fe093ec-5a01-4d70-aebe-54cc47ada21d'),(3,200000.00,'','2026-03-31 03:56:41.402000','a6782f4b-a613-4d2a-a78f-d98e67c55ac0','3fe093ec-5a01-4d70-aebe-54cc47ada21d');
/*!40000 ALTER TABLE `saving_transactions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `savings`
--

DROP TABLE IF EXISTS `savings`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `savings` (
  `id` varchar(255) NOT NULL,
  `category` varchar(255) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `current_amount` decimal(38,2) DEFAULT NULL,
  `period` enum('MONTHLY','WEEKLY','YEARLY') DEFAULT NULL,
  `status` enum('ACTIVE','COMPLETED','WITHDRAWN') DEFAULT NULL,
  `target_amount` decimal(38,2) DEFAULT NULL,
  `target_date` date DEFAULT NULL,
  `title` varchar(255) DEFAULT NULL,
  `type` enum('GOAL','PERIODIC') DEFAULT NULL,
  `wallet_id` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FKg18gt5p6mp92g4xls6at5db42` (`wallet_id`),
  CONSTRAINT `FKg18gt5p6mp92g4xls6at5db42` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `savings`
--

LOCK TABLES `savings` WRITE;
/*!40000 ALTER TABLE `savings` DISABLE KEYS */;
INSERT INTO `savings` VALUES ('96c6a129-784c-4db9-a040-3578a062dbd9','Đầu tư','VND',0.00,NULL,'WITHDRAWN',2000000.00,'2026-05-29','Tiết kiệm mua đồng hồ','GOAL','3ac4a922-7567-469d-af30-f346e0f2a7ba'),('a6782f4b-a613-4d2a-a78f-d98e67c55ac0','Đầu tư','VND',200000.00,'WEEKLY',NULL,2000000.00,NULL,'Tiết kiệm mua đồng hồ','PERIODIC','3ac4a922-7567-469d-af30-f346e0f2a7ba'),('f41f4ffc-8b60-4f07-b7e2-1e1f0a8f021a','Đầu tư','VND',0.00,NULL,NULL,1800000.00,'2026-05-29','Tiết kiệm mua đồng hồ','GOAL','3fe093ec-5a01-4d70-aebe-54cc47ada21d');
/*!40000 ALTER TABLE `savings` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sub_category`
--

DROP TABLE IF EXISTS `sub_category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sub_category` (
  `id` varchar(255) NOT NULL,
  `subcategory_name` varchar(255) NOT NULL,
  `category_id` varchar(255) DEFAULT NULL,
  `owner_id` varchar(255) DEFAULT NULL,
  `is_default` tinyint(1) DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `category_id` (`category_id`),
  KEY `owner_id` (`owner_id`),
  CONSTRAINT `sub_category_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`),
  CONSTRAINT `sub_category_ibfk_2` FOREIGN KEY (`owner_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sub_category`
--

LOCK TABLES `sub_category` WRITE;
/*!40000 ALTER TABLE `sub_category` DISABLE KEYS */;
/*!40000 ALTER TABLE `sub_category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transaction`
--

DROP TABLE IF EXISTS `transaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transaction` (
  `id` varchar(255) NOT NULL,
  `type` enum('INCOME','EXPENSE','TRANSFER') DEFAULT NULL,
  `amount` decimal(38,2) DEFAULT NULL,
  `description` varchar(255) DEFAULT NULL,
  `wallet_id` varchar(255) DEFAULT NULL,
  `to_wallet_id` varchar(255) DEFAULT NULL,
  `category_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `wallet_id` (`wallet_id`),
  KEY `to_wallet_id` (`to_wallet_id`),
  KEY `category_id` (`category_id`),
  CONSTRAINT `transaction_ibfk_1` FOREIGN KEY (`wallet_id`) REFERENCES `wallet` (`id`),
  CONSTRAINT `transaction_ibfk_2` FOREIGN KEY (`to_wallet_id`) REFERENCES `wallet` (`id`),
  CONSTRAINT `transaction_ibfk_3` FOREIGN KEY (`category_id`) REFERENCES `category` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transaction`
--

LOCK TABLES `transaction` WRITE;
/*!40000 ALTER TABLE `transaction` DISABLE KEYS */;
INSERT INTO `transaction` VALUES ('12118b4b-8359-4bde-b405-39c37d26d74c','EXPENSE',20000.00,'tôi nay tiêu 20k cho việc đổ xăng','10bff538-bc27-450a-bf3c-d03bf6a9b104',NULL,'c5d6015a-23d8-11f1-a81c-00155dd601e4','2026-04-24 09:08:57'),('13ec1933-d750-4b79-8aa8-6115d476fef4','EXPENSE',200000.00,'ăn buffet','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf','2026-03-26 01:12:57'),('17bfab06-9e22-497a-b7d1-0d18faa71354','EXPENSE',20000.00,'tôi ăn kem ở mixue hết 20k','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf',NULL),('189b3d91-7db3-4a42-9edb-24b23035fd60','INCOME',20000000.00,'tôi nay được nhận 20M từ học bổng','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'6670484d-17f1-4850-9692-96edd4761c87',NULL),('281a1c5f-4edf-4319-80ee-3172da982c7c','EXPENSE',200000.00,'Saving: Tiết kiệm mua đồng hồ','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,NULL,NULL),('290c62d6-608f-49b2-b111-6430aaa03b19','EXPENSE',20000.00,'tôi hôm nay ăn kem hết 20k','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf','2026-05-14 08:53:44'),('46a57392-784f-4e91-8845-16160a3ea281','EXPENSE',45000.00,'Ghi giúp tôi ăn trưa 45k','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf','2026-05-06 14:19:41'),('4d0b0232-7f9d-4ade-9165-514b6ac30ca8','INCOME',20000.00,'Withdraw Saving: Tiết kiệm mua đồng hồ','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,NULL,NULL),('4f8ba808-3d21-440c-af90-e135d8592e9f','EXPENSE',20000.00,'nay tôi đổ xăng hết 20k','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf',NULL),('51ab61f5-22ae-4d3d-b1c6-579e4c83b8c9','EXPENSE',20000.00,'Saving: Tiết kiệm mua đồng hồ','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,NULL,NULL),('56f2153f-1c36-42aa-955f-f4867ce3c6f6','INCOME',20000.00,'Mẹ cho','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,NULL,'2026-03-20 01:57:11'),('5c4d0d29-ccb1-48c8-914a-5edef025114e','INCOME',1515000.00,'vậy tôi nhận lương được 15M mà không phải 15 nha','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'6670484d-17f1-4850-9692-96edd4761c87','2026-03-24 06:49:18'),('5e11c746-dd7d-4d27-8900-8334255260c9','EXPENSE',20000.00,'tôi ăn kem hết 20k','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf',NULL),('5fe5d183-b6b5-4989-9320-8b2021cde27a','EXPENSE',20000.00,'hôm nay tôi dùng ví test api để chi 20k tiền đi xe buýt','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'c5d6015a-23d8-11f1-a81c-00155dd601e4','2026-05-06 14:13:46'),('632d7b53-5928-4c8b-8a54-567b1146c2e8','INCOME',15.00,'tôi nhận lương tháng này 15m','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'6670484d-17f1-4850-9692-96edd4761c87','2026-03-24 06:48:17'),('68ba3269-2aae-417f-9ae6-059d2571151b','EXPENSE',20000.00,'Ăn kem mueheh','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf','2026-05-14 08:54:35'),('7716422d-b46f-4f96-a12d-3b4516503fe2','EXPENSE',5000000.00,'Xăng xe','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,NULL,'2026-03-20 01:53:35'),('7f335232-e036-4617-b12f-8d1b7491ffe8','EXPENSE',20000.00,'hôm nay tôi dùng ví test api để chi 20k tiền ăn kem ở mixue','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf','2026-05-06 14:12:07'),('80146f15-8cb7-42d9-8d8f-8de4cbbfd34c','INCOME',20000000.00,'Tiền dự án','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'6670484d-17f1-4850-9692-96edd4761c87','2026-03-30 01:26:43'),('85cf689b-dbfe-4ff3-a466-c3752cc49387','INCOME',10000000.00,'tôi mới nhận lương được 10M','10bff538-bc27-450a-bf3c-d03bf6a9b104',NULL,'c5d61906-23d8-11f1-a81c-00155dd601e4','2026-04-24 09:09:28'),('96f2e76c-390e-45bd-8a97-e759556345ad','EXPENSE',5000.00,'tôi mua kéo hết 5k','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'7cbdf62c-f456-424e-b9fa-a5b1c9c6569f',NULL),('a53f17ce-80e9-4919-bb54-44b30375a207','EXPENSE',300000.00,'Banh Tráng','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'c5d19e60-23d8-11f1-a81c-00155dd601e4','2026-03-20 02:09:20'),('b5ca9eeb-fdb7-45f8-bef6-7b54c2dddc82','EXPENSE',60000.00,'Trả nợ: Vay Xe (Mã nợ: 4)','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'04b190d5-257f-4705-9f7f-244a76877b7e','2026-03-30 03:56:15'),('b97c3870-7a45-43e3-a17c-2534ca42fccf','EXPENSE',20000.00,'Nay tôi đổ xăng hết 20k','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf',NULL),('be009cc1-23d9-11f1-a81c-00155dd601e4','EXPENSE',50000.00,'Ăn sáng bánh mì','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'c5d19e60-23d8-11f1-a81c-00155dd601e4','2026-03-19 21:22:32'),('c5d9a8a5-23d8-11f1-a81c-00155dd601e4','INCOME',15000000.00,'Lương tháng 3','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,'c5d61906-23d8-11f1-a81c-00155dd601e4','2026-03-19 21:15:36'),('f02d874e-a016-4a08-988e-53cc20561d24','EXPENSE',20000.00,'Đi ăn','10bff538-bc27-450a-bf3c-d03bf6a9b104',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf','2026-04-24 08:49:59'),('f50a03af-eea9-4d6a-b063-718beffc3c64','EXPENSE',200000.00,'Ăn Lẩu','3fe093ec-5a01-4d70-aebe-54cc47ada21d',NULL,NULL,'2026-03-20 02:06:23'),('fe4a84d9-a92c-403d-91b0-f248ef9c5eb3','EXPENSE',20000.00,'tôi đổ xăng hết 20k','3ac4a922-7567-469d-af30-f346e0f2a7ba',NULL,'aab4dc2e-6699-49f3-a262-695a6623e7bf',NULL);
/*!40000 ALTER TABLE `transaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `wallet`
--

DROP TABLE IF EXISTS `wallet`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `wallet` (
  `id` varchar(255) NOT NULL,
  `type` enum('CASH','CREDIT') DEFAULT NULL,
  `name` varchar(255) DEFAULT NULL,
  `currency` varchar(255) DEFAULT NULL,
  `initial_balance` decimal(38,2) DEFAULT NULL,
  `credit_limit` decimal(38,2) DEFAULT NULL,
  `unpaid_balance` decimal(38,2) DEFAULT NULL,
  `expiry_date` date DEFAULT NULL,
  `account_id` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `account_id` (`account_id`),
  CONSTRAINT `wallet_ibfk_1` FOREIGN KEY (`account_id`) REFERENCES `account` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `wallet`
--

LOCK TABLES `wallet` WRITE;
/*!40000 ALTER TABLE `wallet` DISABLE KEYS */;
INSERT INTO `wallet` VALUES ('10bff538-bc27-450a-bf3c-d03bf6a9b104','CASH','Test AI','VND',10159999.00,NULL,NULL,NULL,'1c5634ed-0068-4b63-b3d5-fbfd29f60e2d','2026-04-24 08:44:34','2026-04-24 09:09:28'),('3ac4a922-7567-469d-af30-f346e0f2a7ba','CREDIT','test ví tín dụng','VND',NULL,2000000.00,1790014.00,'2027-05-29','82773c58-e7a1-4e73-bf2f-1e2ee78dbee6','2026-03-18 02:06:21','2026-03-30 01:56:36'),('3fe093ec-5a01-4d70-aebe-54cc47ada21d','CASH','test api','VND',8067000.00,NULL,NULL,NULL,'82773c58-e7a1-4e73-bf2f-1e2ee78dbee6','2026-03-18 02:02:13','2026-05-14 08:54:34');
/*!40000 ALTER TABLE `wallet` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-21  8:19:58
