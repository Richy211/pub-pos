-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 01-04-2026 a las 17:37:10
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
(70, 2, 'paid', '2026-03-27 21:31:39'),
(71, 3, 'cancelled', '2026-03-30 15:13:29'),
(72, 3, 'paid', '2026-03-30 15:14:35'),
(73, 2, 'open', '2026-03-30 19:57:47');

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
(453, 70, 2, 1),
(455, 72, 7, 1),
(456, 72, 12, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `payments`
--

CREATE TABLE `payments` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) DEFAULT NULL,
  `payment_date` date DEFAULT NULL,
  `payment_method` varchar(50) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `price` decimal(10,2) DEFAULT NULL,
  `stock` int(11) DEFAULT 0,
  `cost_price` decimal(10,2) DEFAULT 0.00
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `products`
--

INSERT INTO `products` (`id`, `name`, `price`, `stock`, `cost_price`) VALUES
(1, 'Cerveza', 3000.00, 179, 0.00),
(2, 'Papas fritas', 4000.00, 0, 0.00),
(3, 'Hamburguesa', 7000.00, 333, 0.00),
(5, 'Chorrillanas', 8000.00, 0, 0.00),
(7, 'Completos', 4000.00, 0, 0.00),
(11, 'Pisco Sour', 7000.00, 0, 0.00),
(12, 'Coca cola', 3500.00, 0, 0.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `supplier_id` int(11) DEFAULT NULL,
  `invoice_number` varchar(50) DEFAULT NULL,
  `date` date DEFAULT NULL,
  `total_net` decimal(10,2) DEFAULT NULL,
  `iva` decimal(10,2) DEFAULT NULL,
  `total` decimal(10,2) DEFAULT NULL,
  `status` varchar(20) DEFAULT 'pendiente',
  `payment_status` varchar(20) DEFAULT 'pendiente',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `purchases`
--

INSERT INTO `purchases` (`id`, `supplier_id`, `invoice_number`, `date`, `total_net`, `iva`, `total`, `status`, `payment_status`, `created_at`) VALUES
(1, 1, 'F123', '2026-03-30', 10000.00, 1900.00, 11900.00, 'recibido', 'pendiente', '2026-03-30 15:54:30'),
(2, 1, NULL, '2026-03-30', 20000.00, 3800.00, 23800.00, 'recibido', 'pendiente', '2026-03-30 16:42:57'),
(3, 1, NULL, '2026-03-30', 1000.00, 190.00, 1190.00, 'recibido', 'pendiente', '2026-03-30 19:07:07'),
(4, 1, NULL, '2026-03-30', 1000.00, 190.00, 1190.00, 'recibido', 'pendiente', '2026-03-30 19:07:39'),
(5, 1, NULL, '2026-03-30', 20000.00, 3800.00, 23800.00, 'recibido', 'pendiente', '2026-03-30 19:20:19'),
(6, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:22:14'),
(7, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:28:09'),
(8, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:28:10'),
(9, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:33:37'),
(10, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:39:41'),
(11, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:39:44'),
(12, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:39:49'),
(13, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:48:12'),
(14, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:48:49'),
(15, 1, NULL, '2026-03-30', 100.00, 19.00, 119.00, 'recibido', 'pendiente', '2026-03-30 19:49:05'),
(22, 1, NULL, '2026-03-31', 99999999.99, 99999999.99, 99999999.99, 'recibido', 'pendiente', '2026-03-31 20:59:04'),
(23, 1, NULL, '2026-03-31', 99999999.99, 99999999.99, 99999999.99, 'recibido', 'pendiente', '2026-03-31 21:00:39'),
(25, 1, NULL, '2026-03-31', 11149889.00, 2118478.91, 13268367.91, 'recibido', 'pendiente', '2026-03-31 21:07:20'),
(26, 1, NULL, '2026-03-31', 15400000.00, 2926000.00, 18326000.00, 'recibido', 'pendiente', '2026-03-31 21:09:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `purchase_details`
--

CREATE TABLE `purchase_details` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) DEFAULT NULL,
  `product_id` int(11) DEFAULT NULL,
  `quantity` int(11) DEFAULT NULL,
  `unit_price_net` decimal(10,2) DEFAULT NULL,
  `subtotal_net` decimal(10,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `purchase_details`
--

INSERT INTO `purchase_details` (`id`, `purchase_id`, `product_id`, `quantity`, `unit_price_net`, `subtotal_net`) VALUES
(1, 1, 1, 10, 1000.00, 10000.00),
(2, 9, 1, 1, 100.00, 100.00),
(3, 10, 1, 1, 100.00, 100.00),
(4, 11, 1, 1, 100.00, 100.00),
(5, 12, 1, 1, 100.00, 100.00),
(6, 13, 1, 1, 100.00, 100.00),
(7, 14, 1, 1, 100.00, 100.00),
(8, 15, 1, 1, 100.00, 100.00),
(10, 22, 1, 40, 40000.00, 1600000.00),
(12, 23, 1, 40, 40000.00, 1600000.00),
(13, 25, 3, 333, 33333.00, 11099889.00),
(14, 25, 1, 5, 10000.00, 50000.00),
(15, 26, 1, 77, 200000.00, 15400000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `suppliers`
--

CREATE TABLE `suppliers` (
  `id` int(11) NOT NULL,
  `name` varchar(100) DEFAULT NULL,
  `rut` varchar(20) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `address` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `suppliers`
--

INSERT INTO `suppliers` (`id`, `name`, `rut`, `phone`, `email`, `address`, `created_at`) VALUES
(1, 'Distribuidora Norte', '76.123.456-7', '912345678', 'ventas@norte.cl', NULL, '2026-03-30 15:54:18'),
(2, 'Bebidas Chile', '77.987.654-3', '987654321', 'contacto@bebidas.cl', NULL, '2026-03-30 15:54:18');

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
-- Indices de la tabla `payments`
--
ALTER TABLE `payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`);

--
-- Indices de la tabla `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD KEY `supplier_id` (`supplier_id`);

--
-- Indices de la tabla `purchase_details`
--
ALTER TABLE `purchase_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `product_id` (`product_id`);

--
-- Indices de la tabla `suppliers`
--
ALTER TABLE `suppliers`
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
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=74;

--
-- AUTO_INCREMENT de la tabla `order_items`
--
ALTER TABLE `order_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=457;

--
-- AUTO_INCREMENT de la tabla `payments`
--
ALTER TABLE `payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT de la tabla `purchase_details`
--
ALTER TABLE `purchase_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT de la tabla `suppliers`
--
ALTER TABLE `suppliers`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

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

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `payments`
--
ALTER TABLE `payments`
  ADD CONSTRAINT `payments_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`);

--
-- Filtros para la tabla `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`supplier_id`) REFERENCES `suppliers` (`id`);

--
-- Filtros para la tabla `purchase_details`
--
ALTER TABLE `purchase_details`
  ADD CONSTRAINT `purchase_details_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`),
  ADD CONSTRAINT `purchase_details_ibfk_2` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
