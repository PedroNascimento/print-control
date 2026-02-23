import { Email } from '../value-objects/Email';

export interface UserProps {
  id: string;
  name: string;
  email: Email;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
}

export class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: Email;
  public readonly passwordHash: string;
  public readonly createdAt: Date;
  public readonly updatedAt: Date;

  constructor(props: UserProps) {
    this.id = props.id;
    this.name = props.name;
    this.email = props.email;
    this.passwordHash = props.passwordHash;
    this.createdAt = props.createdAt;
    this.updatedAt = props.updatedAt;
  }

  static create(props: {
    id: string;
    name: string;
    email: Email;
    passwordHash: string;
  }): User {
    const now = new Date();
    return new User({
      ...props,
      createdAt: now,
      updatedAt: now,
    });
  }
}
