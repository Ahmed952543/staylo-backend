import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  ManyToMany,
  JoinColumn,
  JoinTable,
} from 'typeorm';
import type { Relation } from 'typeorm';
import { User } from '../../users/entities/user.entity.js';
import { ListingImage } from './listing-image.entity.js';
import { Amenity } from './amenity.entity.js';
import { numericTransformer } from '../../common/numeric.transformer.js';

export const PROPERTY_TYPES = ['apartment', 'house', 'villa', 'cabin', 'room'] as const;
export type PropertyType = (typeof PROPERTY_TYPES)[number];

@Entity({ name: 'listings' })
export class Listing {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id!: number;

  @Column({ name: 'host_id', type: 'int' })
  hostId!: number;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'host_id' })
  host!: Relation<User>;

  @Column({ type: 'varchar', length: 150 })
  title!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({ name: 'property_type', type: 'varchar', length: 30 })
  propertyType!: PropertyType;

  @Column({ type: 'varchar', length: 100 })
  city!: string;

  @Column({ type: 'varchar', length: 100 })
  country!: string;

  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({
    name: 'price_per_night',
    type: 'numeric',
    precision: 10,
    scale: 2,
    transformer: numericTransformer,
  })
  pricePerNight!: number;

  @Column({ name: 'max_guests', type: 'smallint' })
  maxGuests!: number;

  @Column({ type: 'smallint', default: 1 })
  bedrooms!: number;

  @Column({ type: 'smallint', default: 1 })
  beds!: number;

  @Column({ type: 'smallint', default: 1 })
  bathrooms!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ListingImage, (image) => image.listing, { cascade: ['insert'] })
  images!: Relation<ListingImage[]>;

  @ManyToMany(() => Amenity)
  @JoinTable({
    name: 'listing_amenities',
    joinColumn: { name: 'listing_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'amenity_id', referencedColumnName: 'id' },
  })
  amenities!: Relation<Amenity[]>;
}