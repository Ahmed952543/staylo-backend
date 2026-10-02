import {Entity, PrimaryGeneratedColumn, Column} from 'typeorm';

@Entity({ name: 'amenities' })
export class Amenity {
  @PrimaryGeneratedColumn('identity', { generatedIdentity: 'ALWAYS' })
  id!: number;

  @Column({ type: 'varchar', length: 50, unique: true })
  name!: string;
}