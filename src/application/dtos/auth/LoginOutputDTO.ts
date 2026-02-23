export interface LoginOutputDTO {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}
