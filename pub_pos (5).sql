-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-04-2026 a las 16:57:45
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pub_pos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categories`
--

INSERT INTO `categories` (`id`, `name`) VALUES
(1, 'Cervezas'),
(2, 'Tragos'),
(3, 'Comida'),
(4, 'Bebidas');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras`
--

CREATE TABLE `compras` (
  `id` int(11) NOT NULL,
  `proveedor_id` int(11) DEFAULT NULL,
  `date` datetime DEFAULT NULL,
  `total_net` int(11) DEFAULT NULL,
  `iva` int(11) DEFAULT NULL,
  `total` int(11) DEFAULT NULL,
  `status` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `compras`
--

INSERT INTO `compras` (`id`, `proveedor_id`, `date`, `total_net`, `iva`, `total`, `status`) VALUES
(6, 2, NULL, NULL, NULL, 300000, NULL),
(7, 3, NULL, NULL, NULL, 2400000, NULL),
(8, 1, NULL, NULL, NULL, 300000, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras_detalle`
--

CREATE TABLE `compras_detalle` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit_price_net` int(11) DEFAULT NULL,
  `subtotal_net` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `compras_detalle`
--

INSERT INTO `compras_detalle` (`id`, `purchase_id`, `product_id`, `quantity`, `unit_price_net`, `subtotal_net`) VALUES
(1, 1, 1, 10, 3000, 30000),
(2, 1, 2, 100, 4000, 400000),
(3, 2, 4, 100, 14000, 1400000),
(4, 3, 1, 5, 1000, 5000),
(5, 9, 11, 20, 15000, 300000),
(6, 9, 10, 200, 3000, 600000),
(7, 10, 1, 10, 3000, 30000),
(8, 11, 1, 20, 3000, 60000),
(9, 12, 1, 10, 1000, 10000),
(10, 13, 1, 10, 2000, 20000),
(11, 14, 12, 20, 3000, 60000),
(12, 15, 12, 100, 3000, 300000),
(13, 16, 21, 100, 3500, 350000),
(14, 16, 16, 100, 3500, 350000),
(15, 16, 23, 100, 3000, 300000);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `compras_items`
--

CREATE TABLE `compras_items` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `compras_items`
--

INSERT INTO `compras_items` (`id`, `purchase_id`, `product_id`, `quantity`, `price`) VALUES
(1, 6, 5, 100, 3000.00),
(2, 7, 7, 100, 8000.00),
(3, 7, 8, 100, 8000.00),
(4, 7, 9, 100, 8000.00),
(5, 8, 1, 100, 3000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `table_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT 0.00,
  `paid_at` datetime DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp(),
  `closed_at` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id`, `table_id`, `status`, `total`, `paid_at`, `created_at`, `closed_at`) VALUES
(1, 1, 'paid', 50000.00, NULL, '2026-04-08 12:15:56', NULL),
(2, 3, 'paid', 30000.00, NULL, '2026-04-08 12:15:56', NULL),
(3, 2, 'paid', 25000.00, NULL, '2026-04-08 12:15:56', NULL),
(5, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(8, 5, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(10, 3, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(11, 1, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(12, 3, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(13, 3, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(14, 4, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(15, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(16, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(17, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(18, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(19, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(20, 1, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(22, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(24, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(25, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(26, 4, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(27, 2, 'paid', 30000.00, NULL, '2026-04-08 12:15:56', NULL),
(28, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(29, 3, 'cancelled', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(30, 2, 'cancelled', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(31, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(32, 2, 'cancelled', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(33, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(34, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(35, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(36, 3, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(37, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(38, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(39, 1, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(40, 3, 'cancelled', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(41, 3, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(42, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(43, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(44, 5, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(45, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(46, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(47, 3, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(48, 2, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(49, 5, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(50, 3, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(51, 5, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(52, 1, 'cancelled', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(53, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(54, 4, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(55, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(56, 2, 'cancelled', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(57, 6, 'paid', 0.00, NULL, '2026-04-08 12:15:56', NULL),
(58, 3, 'paid', 0.00, NULL, '2026-04-08 12:33:52', NULL),
(59, 4, 'paid', 0.00, NULL, '2026-04-08 12:40:55', NULL),
(60, 4, 'paid', 0.00, NULL, '2026-04-08 12:52:32', NULL),
(61, 1, 'cancelled', 0.00, NULL, '2026-04-08 16:34:43', NULL),
(62, 2, 'paid', 0.00, NULL, '2026-04-08 16:38:22', NULL),
(63, 1, 'paid', 0.00, NULL, '2026-04-08 17:20:01', NULL),
(64, 2, 'paid', 0.00, NULL, '2026-04-08 17:32:59', NULL),
(65, 3, 'cancelled', 0.00, NULL, '2026-04-08 17:33:55', NULL),
(66, 6, 'cancelled', 0.00, NULL, '2026-04-08 18:14:31', NULL),
(67, 3, 'paid', 0.00, NULL, '2026-04-08 18:15:44', NULL),
(68, 6, 'paid', 0.00, NULL, '2026-04-08 18:28:32', NULL),
(69, 3, 'cancelled', 0.00, NULL, '2026-04-08 18:31:26', NULL),
(70, 5, 'cancelled', 0.00, NULL, '2026-04-08 18:53:39', NULL),
(71, 3, 'paid', 0.00, NULL, '2026-04-09 12:16:07', NULL),
(72, 5, 'paid', 0.00, NULL, '2026-04-09 12:27:54', NULL),
(73, 3, 'paid', 0.00, NULL, '2026-04-09 15:53:20', NULL),
(74, 2, 'paid', 0.00, NULL, '2026-04-09 17:00:30', NULL),
(75, 5, 'paid', 0.00, NULL, '2026-04-09 17:01:50', NULL),
(76, 1, 'paid', 0.00, NULL, '2026-04-09 17:23:10', NULL),
(77, 3, 'paid', 0.00, NULL, '2026-04-09 17:23:32', NULL),
(78, 6, 'paid', 60000.00, NULL, '2026-04-09 17:23:47', NULL),
(79, 1, 'paid', 25000.00, NULL, '2026-04-09 18:23:17', NULL),
(80, 1, 'paid', 0.00, NULL, '2026-04-09 18:34:35', NULL),
(81, 1, 'paid', 0.00, NULL, '2026-04-10 11:10:46', NULL),
(82, 3, 'paid', 0.00, NULL, '2026-04-10 11:10:57', NULL),
(83, 6, 'paid', 0.00, NULL, '2026-04-10 11:11:41', NULL),
(84, NULL, 'open', 0.00, NULL, '2026-04-10 14:42:28', NULL),
(85, NULL, 'open', 0.00, NULL, '2026-04-10 14:46:07', NULL),
(86, NULL, 'open', 0.00, NULL, '2026-04-10 14:46:14', NULL),
(87, NULL, 'open', 0.00, NULL, '2026-04-10 14:46:31', NULL),
(88, NULL, 'open', 0.00, NULL, '2026-04-10 14:55:07', NULL),
(89, NULL, 'open', 0.00, NULL, '2026-04-10 14:55:25', NULL),
(90, NULL, 'open', 0.00, NULL, '2026-04-10 14:55:31', NULL),
(91, NULL, 'open', 0.00, NULL, '2026-04-10 15:02:59', NULL),
(92, NULL, 'open', 0.00, NULL, '2026-04-10 15:03:16', NULL),
(93, NULL, 'open', 0.00, NULL, '2026-04-10 15:03:43', NULL),
(94, NULL, 'open', 0.00, NULL, '2026-04-10 15:09:59', NULL),
(95, NULL, 'cancelled', 0.00, NULL, '2026-04-10 15:10:21', NULL),
(96, NULL, 'cancelled', 0.00, NULL, '2026-04-10 15:10:30', NULL),
(97, NULL, 'open', 0.00, NULL, '2026-04-10 15:11:09', NULL),
(98, 2, 'paid', 0.00, NULL, '2026-04-10 15:17:46', NULL),
(99, 2, 'paid', 0.00, NULL, '2026-04-10 16:39:43', NULL),
(100, 1, 'paid', 0.00, NULL, '2026-04-10 17:25:28', NULL),
(101, 5, 'paid', 0.00, NULL, '2026-04-10 17:35:25', NULL),
(102, 2, 'paid', 0.00, NULL, '2026-04-10 17:45:56', NULL),
(103, 3, 'paid', 0.00, NULL, '2026-04-10 17:48:10', NULL),
(104, 3, 'paid', 0.00, NULL, '2026-04-10 17:50:34', NULL),
(105, 2, 'paid', 0.00, NULL, '2026-04-10 18:00:12', NULL),
(106, 1, 'paid', 0.00, NULL, '2026-04-11 13:20:43', NULL),
(107, 6, 'paid', 0.00, NULL, '2026-04-11 13:21:13', NULL),
(108, 1, 'paid', 0.00, NULL, '2026-04-11 13:30:02', NULL),
(109, 6, 'paid', 0.00, NULL, '2026-04-11 13:39:03', NULL),
(110, 2, 'paid', 0.00, NULL, '2026-04-11 13:39:22', NULL),
(111, 1, 'paid', 0.00, NULL, '2026-04-11 15:27:22', NULL),
(112, 3, 'paid', 0.00, NULL, '2026-04-11 15:38:34', NULL),
(113, 5, 'open', 0.00, NULL, '2026-04-11 16:12:20', NULL),
(114, 3, 'paid', 0.00, NULL, '2026-04-11 16:19:58', NULL),
(115, 2, 'paid', 0.00, NULL, '2026-04-12 16:00:35', NULL),
(116, 2, 'paid', 0.00, NULL, '2026-04-12 20:02:25', NULL),
(117, 6, 'paid', 0.00, NULL, '2026-04-12 20:03:09', NULL),
(118, 1, 'open', 0.00, NULL, '2026-04-12 20:09:05', NULL),
(119, 2, 'paid', 0.00, NULL, '2026-04-12 20:09:20', NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `cost` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `quantity`, `price`, `cost`) VALUES
(1, 1, 1, 2, 0.00, 0.00),
(2, 1, 2, 2, 0.00, 0.00),
(3, 1, 3, 2, 0.00, 0.00),
(4, 2, 2, 3, 0.00, 0.00),
(5, 2, 3, 3, 0.00, 0.00),
(6, 3, 2, 2, 0.00, 0.00),
(7, 3, 1, 1, 0.00, 0.00),
(11, 5, 1, 1, 0.00, 0.00),
(12, 5, 2, 2, 0.00, 0.00),
(14, 5, 4, 4, 0.00, 0.00),
(23, 9, 2, 3, 0.00, 0.00),
(26, 9, 1, 3, 0.00, 0.00),
(29, 9, 4, 3, 0.00, 0.00),
(32, 10, 4, 3, 0.00, 0.00),
(35, 11, 1, 2, 0.00, 0.00),
(37, 11, 2, 3, 0.00, 0.00),
(40, 11, 4, 2, 0.00, 0.00),
(42, 12, 1, 1, 0.00, 0.00),
(43, 12, 2, 2, 0.00, 0.00),
(45, 13, 1, 3, 0.00, 0.00),
(46, 13, 2, 1, 0.00, 0.00),
(47, 13, 4, 3, 0.00, 0.00),
(52, 14, 4, 1, 0.00, 0.00),
(60, 15, 2, 1, 0.00, 0.00),
(61, 15, 4, 3, 0.00, 0.00),
(64, 16, 4, 2, 0.00, 0.00),
(66, 16, 2, 2, 0.00, 0.00),
(68, 16, 1, 2, 0.00, 0.00),
(70, 17, 4, 1, 0.00, 0.00),
(71, 18, 1, 1, 0.00, 0.00),
(72, 18, 2, 1, 0.00, 0.00),
(73, 19, 6, 1, 0.00, 0.00),
(74, 19, 7, 4, 0.00, 0.00),
(78, 19, 2, 1, 0.00, 0.00),
(79, 19, 4, 2, 0.00, 0.00),
(81, 19, 1, 1, 0.00, 0.00),
(82, 20, 4, 3, 0.00, 0.00),
(83, 20, 2, 1, 0.00, 0.00),
(84, 20, 1, 5, 0.00, 0.00),
(85, 21, 9, 1, 0.00, 0.00),
(86, 21, 8, 1, 0.00, 0.00),
(87, 21, 4, 1, 0.00, 0.00),
(88, 22, 4, 2, 0.00, 0.00),
(90, 22, 1, 1, 0.00, 0.00),
(91, 22, 5, 1, 0.00, 0.00),
(93, 22, 9, 1, 0.00, 0.00),
(94, 23, 2, 2, 0.00, 0.00),
(96, 23, 1, 2, 0.00, 0.00),
(98, 23, 5, 1, 0.00, 0.00),
(99, 24, 1, 4, 0.00, 0.00),
(103, 24, 2, 2, 0.00, 0.00),
(105, 24, 5, 2, 0.00, 0.00),
(107, 25, 7, 5, 0.00, 0.00),
(112, 25, 4, 4, 0.00, 0.00),
(116, 25, 8, 1, 0.00, 0.00),
(117, 26, 1, 2, 0.00, 0.00),
(119, 26, 2, 2, 0.00, 0.00),
(121, 27, 2, 5, 0.00, 0.00),
(126, 27, 5, 3, 0.00, 0.00),
(129, 27, 7, 3, 0.00, 0.00),
(132, 27, 8, 2, 0.00, 0.00),
(134, 28, 4, 2, 0.00, 0.00),
(136, 35, 2, 1, 0.00, 0.00),
(137, 35, 4, 2, 0.00, 0.00),
(138, 35, 1, 1, 0.00, 0.00),
(139, 34, 1, 6, 0.00, 0.00),
(140, 34, 2, 2, 0.00, 0.00),
(141, 34, 7, 9, 0.00, 0.00),
(142, 34, 5, 1, 0.00, 0.00),
(143, 34, 4, 1, 0.00, 0.00),
(144, 36, 2, 7, 0.00, 0.00),
(145, 36, 1, 5, 0.00, 0.00),
(146, 36, 4, 5, 0.00, 0.00),
(147, 36, 7, 3, 0.00, 0.00),
(148, 20, 5, 2, 0.00, 0.00),
(149, 20, 8, 3, 0.00, 0.00),
(150, 37, 2, 4, 0.00, 0.00),
(151, 37, 4, 1, 0.00, 0.00),
(152, 37, 8, 1, 0.00, 0.00),
(153, 38, 2, 6, 0.00, 0.00),
(154, 38, 4, 9, 0.00, 0.00),
(155, 38, 1, 5, 0.00, 0.00),
(156, 38, 7, 1, 0.00, 0.00),
(157, 39, 1, 6, 0.00, 0.00),
(158, 39, 7, 5, 0.00, 0.00),
(159, 39, 9, 3, 0.00, 0.00),
(162, 41, 2, 6, 0.00, 0.00),
(163, 41, 5, 6, 0.00, 0.00),
(164, 41, 8, 1, 0.00, 0.00),
(165, 42, 2, 5, 0.00, 0.00),
(166, 42, 5, 4, 0.00, 0.00),
(167, 42, 9, 1, 0.00, 0.00),
(168, 43, 2, 3, 0.00, 0.00),
(169, 43, 4, 4, 0.00, 0.00),
(170, 43, 1, 1, 0.00, 0.00),
(171, 44, 2, 3, 0.00, 0.00),
(172, 44, 7, 2, 0.00, 0.00),
(173, 44, 5, 2, 0.00, 0.00),
(174, 45, 8, 3, 0.00, 0.00),
(175, 45, 5, 1, 0.00, 0.00),
(176, 46, 2, 4, 0.00, 0.00),
(177, 46, 5, 2, 0.00, 0.00),
(178, 46, 9, 2, 0.00, 0.00),
(179, 47, 8, 1, 0.00, 0.00),
(180, 47, 4, 1, 0.00, 0.00),
(181, 48, 2, 1, 0.00, 0.00),
(182, 48, 5, 1, 0.00, 0.00),
(183, 48, 9, 1, 0.00, 0.00),
(184, 49, 7, 1, 0.00, 0.00),
(185, 49, 2, 2, 0.00, 0.00),
(186, 49, 5, 5, 0.00, 0.00),
(187, 49, 9, 4, 0.00, 0.00),
(194, 50, 1, 6, 0.00, 0.00),
(200, 50, 5, 4, 0.00, 0.00),
(203, 50, 2, 4, 0.00, 0.00),
(209, 49, 4, 1, 0.00, 0.00),
(210, 49, 8, 1, 0.00, 0.00),
(214, 53, 7, 2, 0.00, 0.00),
(215, 53, 2, 1, 0.00, 0.00),
(216, 53, 1, 1, 0.00, 0.00),
(217, 54, 8, 1, 0.00, 0.00),
(218, 54, 2, 1, 0.00, 0.00),
(219, 53, 4, 3, 0.00, 0.00),
(220, 55, 4, 1, 0.00, 0.00),
(221, 55, 2, 1, 0.00, 0.00),
(226, 57, 11, 1, 0.00, 0.00),
(227, 57, 10, 3, 0.00, 0.00),
(228, 57, 1, 2, 0.00, 0.00),
(229, 57, 5, 1, 0.00, 0.00),
(230, 58, 7, 4, 10000.00, 0.00),
(231, 58, 4, 3, 14000.00, 0.00),
(232, 59, 1, 5, 3000.00, 1200.00),
(233, 60, 1, 10, 3000.00, 1200.00),
(234, 62, 1, 1, 2000.00, 1500.00),
(239, 67, 4, 4, 14000.00, 0.00),
(240, 67, 5, 4, 3000.00, 0.00),
(241, 67, 2, 4, 4000.00, 0.00),
(242, 68, 7, 4, 10000.00, 0.00),
(244, 68, 5, 7, 3000.00, 0.00),
(245, 68, 2, 3, 4000.00, 0.00),
(248, 64, 7, 3, 10000.00, 0.00),
(249, 64, 8, 6, 10000.00, 0.00),
(257, 71, 7, 4, 10000.00, 0.00),
(258, 71, 1, 5, 3000.00, 1500.00),
(259, 72, 4, 4, 14000.00, 0.00),
(260, 72, 9, 2, 12000.00, 0.00),
(261, 72, 7, 2, 10000.00, 0.00),
(264, 64, 5, 6, 3000.00, 0.00),
(265, 64, 1, 4, 3000.00, 1500.00),
(266, 64, 9, 1, 12000.00, 0.00),
(267, 64, 2, 1, 4000.00, 0.00),
(268, 64, 10, 1, 3000.00, 0.00),
(269, 73, 11, 2, 15000.00, 0.00),
(270, 73, 8, 4, 10000.00, 0.00),
(271, 73, 4, 4, 14000.00, 0.00),
(274, 63, 2, 3, 4000.00, 0.00),
(275, 63, 5, 3, 3000.00, 0.00),
(279, 72, 23, 7, 3000.00, 3000.00),
(280, 72, 21, 12, 3500.00, 3500.00),
(281, 72, 11, 2, 15000.00, 0.00),
(282, 74, 10, 6, 3000.00, 0.00),
(283, 74, 11, 2, 15000.00, 0.00),
(284, 74, 7, 4, 10000.00, 0.00),
(285, 76, 21, 6, 3500.00, 3500.00),
(286, 76, 10, 4, 3000.00, 0.00),
(287, 76, 16, 4, 3500.00, 3500.00),
(288, 77, 7, 2, 10000.00, 0.00),
(289, 77, 2, 1, 4000.00, 0.00),
(290, 77, 21, 5, 3500.00, 3500.00),
(291, 78, 23, 4, 3000.00, 3000.00),
(292, 78, 11, 4, 15000.00, 0.00),
(293, 78, 10, 3, 3000.00, 0.00),
(294, 79, 10, 9, 3000.00, 0.00),
(295, 79, 7, 4, 10000.00, 0.00),
(296, 81, 10, 1, 3000.00, 0.00),
(297, 81, 5, 1, 3000.00, 0.00),
(298, 82, 21, 3, 3500.00, 3500.00),
(299, 82, 10, 2, 3000.00, 0.00),
(300, 83, 16, 2, 3500.00, 3500.00),
(301, 83, 11, 1, 15000.00, 0.00),
(302, 83, 10, 2, 3000.00, 0.00),
(303, 84, 10, 6, 3000.00, 0.00),
(304, 84, 7, 5, 10000.00, 0.00),
(305, 84, 8, 1, 10000.00, 0.00),
(306, 86, 10, 5, 3000.00, 0.00),
(307, 86, 7, 3, 10000.00, 0.00),
(308, 87, 16, 5, 3500.00, 3500.00),
(309, 87, 23, 3, 3000.00, 3000.00),
(310, 87, 4, 3, 14000.00, 0.00),
(311, 88, 16, 3, 3500.00, 3500.00),
(312, 88, 10, 3, 3000.00, 0.00),
(313, 91, 8, 3, 10000.00, 0.00),
(314, 91, 7, 3, 10000.00, 0.00),
(315, 93, 23, 3, 3000.00, 3000.00),
(316, 94, 21, 4, 3500.00, 3500.00),
(317, 97, 8, 3, 10000.00, 0.00),
(318, 98, 16, 2, 3500.00, 3500.00),
(319, 98, 9, 2, 12000.00, 0.00),
(320, 98, 8, 1, 10000.00, 0.00),
(321, 99, 7, 5, 10000.00, 0.00),
(322, 99, 9, 3, 12000.00, 0.00),
(323, 100, 7, 5, 10000.00, 0.00),
(324, 100, 8, 3, 10000.00, 0.00),
(325, 101, 23, 3, 3000.00, 3000.00),
(326, 101, 16, 2, 3500.00, 3500.00),
(327, 101, 10, 4, 3000.00, 0.00),
(329, 103, 10, 5, 3000.00, 0.00),
(330, 103, 16, 3, 3500.00, 3500.00),
(331, 102, 7, 7, 10000.00, 0.00),
(332, 106, 10, 5, 3000.00, 0.00),
(333, 106, 16, 6, 3500.00, 3500.00),
(334, 107, 21, 4, 3500.00, 3500.00),
(335, 107, 10, 5, 3000.00, 0.00),
(336, 108, 10, 5, 3000.00, 0.00),
(338, 108, 7, 2, 10000.00, 0.00),
(339, 108, 8, 4, 10000.00, 0.00),
(340, 109, 21, 6, 3500.00, 3500.00),
(341, 109, 8, 5, 10000.00, 0.00),
(342, 110, 5, 8, 3000.00, 0.00),
(343, 111, 10, 13, 3000.00, 0.00),
(344, 112, 21, 5, 3500.00, 3500.00),
(345, 112, 10, 2, 3000.00, 0.00),
(346, 113, 7, 26, 10000.00, 0.00),
(347, 114, 1, 10, 3000.00, 1500.00),
(348, 114, 2, 11, 4000.00, 0.00),
(349, 110, 11, 5, 15000.00, 0.00),
(350, 115, 11, 6, 15000.00, 0.00),
(351, 115, 10, 4, 3000.00, 0.00),
(352, 115, 26, 1, 3000.00, 0.00),
(353, 115, 9, 1, 12000.00, 0.00),
(354, 111, 2, 4, 4000.00, 0.00),
(355, 116, 22, 4, 4000.00, 0.00),
(356, 117, 22, 4, 4000.00, 0.00),
(357, 117, 31, 8, 4000.00, 0.00),
(358, 119, 25, 6, 12000.00, 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` int(11) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `cost` decimal(10,2) DEFAULT 0.00,
  `last_cost` decimal(10,2) DEFAULT 0.00,
  `category` varchar(100) DEFAULT NULL,
  `category_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `stock`, `cost`, `last_cost`, `category`, `category_id`) VALUES
(1, 'Cerveza', 3000, 50, 1500.00, 2000.00, 'Cervezas', 1),
(2, 'Papas fritas', 4000, 46, 0.00, 0.00, 'Comida', 3),
(4, 'Pisco Capel', 14000, 100, 0.00, 0.00, 'Tragos', 2),
(5, 'Coca Cola', 3000, 30, 0.00, 0.00, 'Bebidas', 4),
(7, 'Combinado Ron Cola', 10000, 10, 0.00, 0.00, 'Tragos', 2),
(8, 'Pisco Sour', 10000, 53, 0.00, 0.00, 'Tragos', 2),
(9, 'Aperol', 12000, 73, 0.00, 0.00, 'Tragos', 2),
(10, 'Hot dog', 3000, 112, 0.00, 0.00, 'Comida', 3),
(11, 'chorrillanas', 15000, 29, 0.00, 0.00, 'Comida', 3),
(16, 'Pepsy cola', 4500, 73, 3500.00, 3500.00, NULL, 4),
(22, 'Corona', 4000, 92, 0.00, 0.00, NULL, 1),
(23, '7 Up', 3000, 80, 3000.00, 3000.00, NULL, 4),
(24, 'Tequila', 12000, 30, 0.00, 0.00, NULL, 2),
(25, 'Tom Collins', 12000, 14, 0.00, 0.00, NULL, 2),
(26, 'Hamburguesas', 3000, 99, 0.00, 0.00, NULL, 3),
(27, 'Coors', 3000, 100, 0.00, 0.00, NULL, 1),
(28, 'Fanta', 3500, 55, 0.00, 0.00, NULL, 4),
(29, 'Ginger ', 12000, 50, 0.00, 0.00, NULL, 2),
(30, 'Becker', 3000, 50, 0.00, 0.00, NULL, 1),
(31, 'Corona', 4000, 92, 0.00, 0.00, NULL, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(255) DEFAULT NULL,
  `contacto` varchar(100) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `proveedores`
--

INSERT INTO `proveedores` (`id`, `nombre`, `contacto`, `telefono`) VALUES
(1, 'CCU', NULL, NULL),
(2, 'Coca Cola', NULL, NULL),
(3, 'Proveedor Local', NULL, NULL),
(4, 'CCU - Cervecería Chile', 'Andrés Pérez', '+56911111111'),
(5, 'Embotelladora Andina', 'Carla Soto', '+56922222222'),
(6, 'Distribuidora Oriente S.A.', 'Juan Pablo', '+56933333333'),
(7, 'Frutos del Maipo', 'Ventas Institucional', '+56944444444'),
(8, 'Carnes Premium Ltda.', 'Ricardo Soto', '+56955555555'),
(9, 'Licores El Barril', 'Marta Gómez', '+56966666666'),
(10, 'Panadería Gran Sabor', 'Pedro Panes', '+56977777777'),
(11, 'Insumos Higienix', 'Sofía Limpia', '+56988888888');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tables`
--

CREATE TABLE `tables` (
  `id` int(11) NOT NULL,
  `number` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tables`
--

INSERT INTO `tables` (`id`, `number`) VALUES
(1, 1),
(2, 2),
(3, 3),
(4, 4),
(5, 5),
(6, 6);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) DEFAULT NULL,
  `password` varchar(255) DEFAULT NULL,
  `role` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(16, 'admin', '$2b$10$07hYk4uzKF.rqWx0iIb9heu.rQo6eUuz.I9KD4BKDHpg0EJXKvJTm', 'admin');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `compras`
--
ALTER TABLE `compras`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `compras_detalle`
--
ALTER TABLE `compras_detalle`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `compras_items`
--
ALTER TABLE `compras_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `order_id` (`order_id`,`product_id`),
  ADD UNIQUE KEY `unique_order_product` (`order_id`,`product_id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `fk_category` (`category_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `tables`
--
ALTER TABLE `tables`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `compras`
--
ALTER TABLE `compras`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT de la tabla `compras_detalle`
--
ALTER TABLE `compras_detalle`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `compras_items`
--
ALTER TABLE `compras_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=120;

--
-- AUTO_INCREMENT de la tabla `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=359;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT de la tabla `tables`
--
ALTER TABLE `tables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `compras_items`
--
ALTER TABLE `compras_items`
  ADD CONSTRAINT `compras_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `compras` (`id`),
  ADD CONSTRAINT `compras_items_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);

--
-- Filtros para la tabla `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `fk_category` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
