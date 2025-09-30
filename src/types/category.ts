import { BaseEntity } from ".";

export interface Category extends BaseEntity {
  name: string;
  description: string;
  image: string;
  isDisable: boolean;
}
