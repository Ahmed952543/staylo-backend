CREATE EXTENSION IF NOT EXISTS btree_gist;

CREATE TABLE users (
    id            INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    full_name     VARCHAR(100) NOT NULL,
    email         VARCHAR(250) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    avatar_url    TEXT,
    is_host       BOOLEAN NOT NULL DEFAULT FALSE,
    created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE listings (
    id              INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    host_id         INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           VARCHAR(150) NOT NULL,
    description     TEXT NOT NULL,
    property_type   VARCHAR(30) NOT NULL
                    CHECK (property_type IN ('apartment', 'house', 'villa', 'cabin', 'room')),
    city            VARCHAR(100) NOT NULL,
    country         VARCHAR(100) NOT NULL,
    address         VARCHAR(255) NOT NULL,
    price_per_night NUMERIC(10, 2) NOT NULL CHECK (price_per_night > 0),
    max_guests      SMALLINT NOT NULL CHECK (max_guests > 0),
    bedrooms        SMALLINT NOT NULL DEFAULT 1 CHECK (bedrooms >= 0),
    beds            SMALLINT NOT NULL DEFAULT 1 CHECK (beds >= 0),
    bathrooms       SMALLINT NOT NULL DEFAULT 1 CHECK (bathrooms >= 0),
    is_active       BOOLEAN NOT NULL DEFAULT TRUE,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_listings_host_id ON listings(host_id);
CREATE INDEX idx_listings_city    ON listings(city);

CREATE TABLE listing_images (
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    url        TEXT NOT NULL,
    position   SMALLINT NOT NULL DEFAULT 0
);

CREATE INDEX idx_listing_images_listing_id ON listing_images(listing_id);

CREATE TABLE amenities (
    id   INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE
);

CREATE TABLE listing_amenities (
    listing_id INT NOT NULL REFERENCES listings(id)  ON DELETE CASCADE,
    amenity_id INT NOT NULL REFERENCES amenities(id) ON DELETE CASCADE,
    PRIMARY KEY (listing_id, amenity_id)
);

CREATE INDEX idx_listing_amenities_amenity_id ON listing_amenities(amenity_id);

CREATE TABLE bookings (
    id           INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    listing_id   INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    guest_id     INT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    check_in     DATE NOT NULL,
    check_out    DATE NOT NULL,
    guests_count SMALLINT NOT NULL CHECK (guests_count > 0),
    total_price  NUMERIC(10, 2) NOT NULL CHECK (total_price >= 0),
    status       VARCHAR(20) NOT NULL DEFAULT 'pending'
                 CHECK (status IN ('pending', 'confirmed', 'cancelled')),
    created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CHECK (check_out > check_in),
    EXCLUDE USING gist (
        listing_id WITH =,
        daterange(check_in, check_out) WITH &&
    ) WHERE (status <> 'cancelled')
);

CREATE INDEX idx_bookings_guest_id ON bookings(guest_id);

CREATE TABLE reviews (
    id         INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    booking_id INT NOT NULL UNIQUE REFERENCES bookings(id) ON DELETE CASCADE,
    listing_id INT NOT NULL REFERENCES listings(id) ON DELETE CASCADE,
    guest_id   INT NOT NULL REFERENCES users(id)    ON DELETE CASCADE,
    rating     SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment    TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_reviews_listing_id ON reviews(listing_id);