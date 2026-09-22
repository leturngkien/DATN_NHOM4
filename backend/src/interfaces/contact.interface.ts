export type ContactStatus = 'new' | 'replied' | 'closed';

export interface IContact {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  message: string;
  status: ContactStatus;
  createdAt?: Date;
  updatedAt?: Date;
}
