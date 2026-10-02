import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import type { Relation } from 'typeorm';
import { Listing } from './listing.entity.js';

@Entity({ name: 'listing_images' })
export class ListingImage {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id!: number;

  @Column({ name: 'listing_id', type: 'int' })
  listingId!: number;

  @ManyToOne(() => Listing, (listing) => listing.images, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'listing_id' })
  listing!: Relation<Listing>;

  @Column({ type: 'text' })
  url!: string;

  @Column({ type: 'smallint', default: 0 })
  position!: number;
}

export { Listing };
