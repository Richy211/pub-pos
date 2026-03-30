-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 30-03-2026 a las 17:21:28
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.1.25

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `pub-pos`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orders`
--

CREATE TABLE `orders` (
  `id` int(11) NOT NULL,
  `table_id` int(11) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'open',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `orders`
--

INSERT INTO `orders` (`id`, `table_id`, `status`, `created_at`) VALUES
(1, 1, 'paid', '2026-03-18 18:40:08'),
(2, 2, 'paid', '2026-03-18 18:45:54'),
(3, 2, 'paid', '2026-03-19 15:43:57'),
(4, 1, 'paid', '2026-03-19 15:44:08'),
(5, 2, 'paid', '2026-03-19 15:47:17'),
(6, 1, 'paid', '2026-03-19 15:47:28'),
(7, 3, 'paid', '2026-03-19 15:47:39'),
(8, 1, 'paid', '2026-03-19 15:51:29'),
(9, 2, 'paid', '2026-03-19 20:00:09'),
(10, 4, 'paid', '2026-03-19 20:15:04'),
(11, 2, 'paid', '2026-03-19 21:31:33'),
(12, 3, 'paid', '2026-03-19 21:31:49'),
(13, 3, 'paid', '2026-03-19 21:31:49'),
(14, 2, 'paid', '2026-03-19 21:44:17'),
(15, 2, 'paid', '2026-03-19 21:44:17'),
(16, 1, 'paid', '2026-03-19 21:52:43'),
(17, 1, 'paid', '2026-03-19 21:54:32'),
(18, 1, 'paid', '2026-03-19 21:54:32'),
(19, 1, 'paid', '2026-03-19 22:06:15'),
(20, 2, 'paid', '2026-03-20 16:03:26'),
(21, 2, 'paid', '2026-03-20 16:03:26'),
(22, 1, 'paid', '2026-03-20 16:03:30'),
(23, 1, 'paid', '2026-03-20 16:03:45'),
(24, 1, 'paid', '2026-03-20 16:03:45'),
(25, 4, 'paid', '2026-03-20 16:12:25'),
(26, 2, 'paid', '2026-03-20 16:16:29'),
(27, 4, 'paid', '2026-03-20 16:21:10'),
(28, 3, 'paid', '2026-03-20 16:30:02'),
(29, 2, 'paid', '2026-03-20 16:39:48'),
(30, 2, 'cancelled', '2026-03-20 16:44:26'),
(31, 3, 'cancelled', '2026-03-20 16:44:46'),
(32, 1, 'paid', '2026-03-20 16:50:15'),
(33, 2, 'cancelled', '2026-03-20 16:52:24'),
(34, 2, 'cancelled', '2026-03-20 16:54:52'),
(35, 1, 'paid', '2026-03-20 16:55:34'),
(36, 3, 'cancelled', '2026-03-20 16:55:46'),
(37, 2, 'cancelled', '2026-03-20 18:40:48'),
(38, 1, 'cancelled', '2026-03-20 18:41:11'),
(39, 2, 'cancelled', '2026-03-20 18:46:19'),
(40, 2, 'cancelled', '2026-03-20 18:46:26'),
(41, 2, 'cancelled', '2026-03-20 18:53:58'),
(42, 3, 'cancelled', '2026-03-20 18:54:06'),
(43, 3, 'paid', '2026-03-20 18:54:16'),
(44, 1, 'paid', '2026-03-20 19:00:16'),
(45, 3, 'cancelled', '2026-03-20 19:00:31'),
(46, 2, 'cancelled', '2026-03-20 19:13:56'),
(47, 3, 'paid', '2026-03-20 19:14:10'),
(48, 1, 'paid', '2026-03-20 19:14:19'),
(49, 2, 'paid', '2026-03-23 00:40:03'),
(50, 4, 'paid', '2026-03-23 00:40:14'),
(51, 2, 'cancelled', '2026-03-23 22:18:27'),
(52, 1, 'cancelled', '2026-03-23 23:35:02'),
(53, 1, 'cancelled', '2026-03-24 01:22:45'),
(54, 3, 'paid', '2026-03-24 01:22:53'),
(55, 1, 'paid', '2026-03-24 22:41:53'),
(56, 2, 'cancelled', '2026-03-24 22:44:14'),
(57, 1, 'cancelled', '2026-03-25 14:49:40'),
(58, 2, 'paid', '2026-03-25 15:42:52'),
(59, 3, 'paid', '2026-03-25 15:43:00'),
(60, 2, 'paid', '2026-03-25 16:18:49'),
(61, 2, 'cancelled', '2026-03-25 19:11:17'),
(62, 1, 'paid', '2026-03-25 20:06:49'),
(63, 3, 'paid', '2026-03-25 20:06:56'),
(64, 2, 'cancelled', '2026-03-26 19:56:21'),
(65, 2, 'paid', '2026-03-26 20:15:52'),
(66, 3, 'paid', '2026-03-26 20:16:43'),
(67, 4, 'paid', '2026-03-26 20:25:22'),
(68, 3, 'paid', '2026-03-27 16:26:17'),
(69, 1, 'open', '2026-03-27 21:16:19'),
(70, 2, 'open', '2026-03-27 21:31:39'),
(71, 3, 'cancelled', '2026-03-30 15:13:29'),
(72, 3, 'open', '2026-03-30 15:14:35');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `order_items`
--

CREATE TABLE `order_items` (
  `id` int(11) NOT NULL,
  `order_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `qty` int(11) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `order_items`
--

INSERT INTO `order_items` (`id`, `order_id`, `product_id`, `qty`) VALUES
(267, 1, 2, 2),
(268, 1, 1, 6),
(269, 2, 1, 1),
(270, 2, 2, 1),
(271, 2, 3, 1),
(272, 1, 3, 1),
(273, 7, 1, 1),
(274, 7, 2, 3),
(275, 10, 2, 3),
(276, 10, 3, 1),
(277, 3, 1, 3),
(278, 3, 2, 1),
(279, 4, 1, 2),
(280, 4, 2, 1),
(281, 4, 3, 1),
(282, 6, 2, 2),
(283, 6, 3, 1),
(284, 5, 2, 3),
(285, 9, 1, 1),
(286, 9, 2, 1),
(287, 11, 1, 1),
(288, 11, 2, 3),
(289, 13, 3, 1),
(290, 13, 2, 3),
(291, 12, 3, 3),
(292, 12, 2, 2),
(293, 12, 1, 2),
(299, 18, 2, 6),
(300, 18, 3, 6),
(301, 17, 1, 5),
(302, 17, 2, 3),
(303, 14, 3, 3),
(304, 14, 2, 2),
(305, 14, 1, 1),
(306, 18, 1, 6),
(307, 19, 1, 1),
(308, 19, 2, 6),
(309, 19, 3, 6),
(310, 15, 2, 5),
(311, 15, 1, 4),
(312, 22, 1, 2),
(313, 22, 2, 2),
(314, 22, 3, 1),
(315, 24, 1, 4),
(316, 24, 2, 4),
(317, 24, 3, 3),
(318, 20, 1, 2),
(319, 20, 2, 3),
(320, 20, 3, 4),
(321, 21, 1, 5),
(322, 21, 2, 4),
(323, 21, 3, 3),
(324, 23, 1, 4),
(325, 23, 2, 4),
(326, 26, 3, 3),
(327, 26, 2, 3),
(328, 25, 1, 3),
(329, 25, 2, 3),
(333, 27, 2, 2),
(334, 27, 3, 2),
(335, 27, 1, 1),
(342, 28, 2, 3),
(343, 28, 3, 1),
(344, 28, 1, 3),
(351, 29, 3, 2),
(352, 29, 2, 2),
(364, 32, 3, 1),
(365, 32, 2, 2),
(366, 32, 1, 1),
(371, 35, 3, 1),
(372, 35, 1, 1),
(390, 43, 3, 1),
(391, 43, 2, 1),
(392, 44, 1, 4),
(393, 44, 2, 3),
(394, 44, 3, 2),
(400, 47, 1, 1),
(401, 47, 2, 1),
(402, 48, 2, 1),
(403, 48, 1, 1),
(404, 49, 1, 1),
(405, 49, 2, 1),
(406, 50, 1, 1),
(407, 50, 2, 1),
(408, 50, 3, 1),
(415, 54, 3, 2),
(416, 54, 1, 2),
(418, 55, 2, 2),
(419, 55, 3, 2),
(420, 55, 1, 1),
(422, 58, 2, 2),
(423, 58, 3, 3),
(424, 58, 1, 1),
(425, 59, 3, 1),
(426, 59, 1, 1),
(427, 60, 2, 2),
(428, 60, 1, 1),
(432, 62, 3, 1),
(433, 62, 2, 2),
(434, 63, 2, 2),
(435, 63, 1, 2),
(436, 62, 4, 1),
(437, 62, 5, 1),
(441, 65, 6, 1),
(442, 65, 1, 1),
(443, 66, 1, 1),
(444, 66, 2, 1),
(445, 66, 3, 1),
(446, 68, 3, 1),
(447, 68, 9, 1),
(448, 68, 7, 1),
(449, 67, 1, 1),
(450, 67, 5, 1),
(451, 70, 13, 1),
(452, 70, 7, 1),
(453, 70, 2, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `name`, `price`) VALUES
(1, 'Cerveza', 3000.00),
(2, 'Papas fritas', 4000.00),
(3, 'Hamburguesa', 7000.00),
(5, 'Chorrillanas', 8000.00),
(7, 'Completos', 4000.00),
(11, 'Pisco Sour', 7000.00),
(12, 'Coca cola', 3000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `tables`
--

CREATE TABLE `tables` (
  `id` int(11) NOT NULL,
  `number` int(11) NOT NULL,
  `status` varchar(20) DEFAULT 'free'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `tables`
--

INSERT INTO `tables` (`id`, `number`, `status`) VALUES
(1, 1, 'free'),
(2, 2, 'free'),
(3, 3, 'free'),
(4, 4, 'free');

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
(9, 'admin', '$2b$10$9AVwLy/bpnIqhIrvAVjwOuqHYpiy3eR389OG0DG7fRNGjUYbxVKR.', 'admin'),
(10, 'garzon', '$2b$10$9AVwLy/bpnIqhIrvAVjwOuqHYpiy3eR389OG0DG7fRNGjUYbxVKR.', 'garzon');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `order_items`
--
ALTER TABLE `order_items`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
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
-- AUTO_INCREMENT de la tabla `orders`
--
ALTER TABLE `orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT de la tabla `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=455;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `tables`
--
ALTER TABLE `tables`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
