INSERT INTO users (full_name, email, password_hash, is_host) VALUES
    ('Omar Hassan',   'omar@staylo.com',    'seed-not-a-real-hash', TRUE),
    ('Laila Mahmoud', 'laila@staylo.com',   'seed-not-a-real-hash', TRUE),
    ('Youssef Adel',  'youssef@staylo.com', 'seed-not-a-real-hash', FALSE),
    ('Sara Nabil',    'sara@staylo.com',    'seed-not-a-real-hash', FALSE);

INSERT INTO amenities (name) VALUES
    ('WiFi'), ('Kitchen'), ('Air conditioning'), ('Pool'),
    ('Free parking'), ('Sea view'), ('Washer'), ('Workspace');

INSERT INTO listings
    (host_id, title, description, property_type, city, country, address,
     price_per_night, max_guests, bedrooms, beds, bathrooms)
VALUES
    (1, 'Sea View Apartment in Stanley', 'Bright apartment facing the Stanley Bridge with a large balcony.',
        'apartment', 'Alexandria', 'Egypt', '12 Corniche Rd, Stanley', 1200.00, 4, 2, 3, 1),
    (1, 'Cozy Cabin by the Red Sea', 'Simple wooden cabin a two-minute walk from the Lighthouse dive site.',
        'cabin', 'Dahab', 'Egypt', 'Lighthouse Area, Dahab', 950.00, 2, 1, 1, 1),
    (2, 'Modern Villa with Private Pool', 'Spacious villa for families and groups, private pool and garden.',
        'villa', 'North Coast', 'Egypt', 'Km 90, Alexandria-Matrouh Rd', 4500.00, 10, 5, 6, 4),
    (2, 'Quiet Room near Zamalek', 'Private room in a calm building, walking distance to cafes and the Nile.',
        'room', 'Cairo', 'Egypt', '26th of July St, Zamalek', 600.00, 2, 1, 1, 1);

INSERT INTO listing_images (listing_id, url, position) VALUES
    (1, 'https://picsum.photos/seed/staylo-1a/800/600', 0),
    (1, 'https://picsum.photos/seed/staylo-1b/800/600', 1),
    (2, 'https://picsum.photos/seed/staylo-2a/800/600', 0),
    (3, 'https://picsum.photos/seed/staylo-3a/800/600', 0),
    (3, 'https://picsum.photos/seed/staylo-3b/800/600', 1),
    (3, 'https://picsum.photos/seed/staylo-3c/800/600', 2),
    (4, 'https://picsum.photos/seed/staylo-4a/800/600', 0);

INSERT INTO listing_amenities (listing_id, amenity_id) VALUES
    (1, 1), (1, 2), (1, 3), (1, 6),
    (2, 1), (2, 6),
    (3, 1), (3, 2), (3, 3), (3, 4), (3, 5), (3, 7),
    (4, 1), (4, 3), (4, 8);

INSERT INTO bookings (listing_id, guest_id, check_in, check_out, guests_count, total_price, status) VALUES
    (1, 3, '2026-08-10', '2026-08-13', 2, 3600.00,  'confirmed'),
    (3, 4, '2026-08-20', '2026-08-24', 6, 18000.00, 'confirmed'),
    (1, 4, '2026-10-05', '2026-10-08', 3, 3600.00,  'pending'),
    (2, 3, '2026-11-01', '2026-11-06', 2, 4750.00,  'cancelled');

INSERT INTO reviews (booking_id, listing_id, guest_id, rating, comment) VALUES
    (1, 1, 3, 5, 'Amazing view of the sea, Omar was very helpful.'),
    (2, 3, 4, 4, 'Great villa for our group, pool was perfect. WiFi was a bit slow.');