import { type TokenRequest } from "ably";
import axios from "axios";

import { type UserCreateOutputType, type UserGetOutputType } from "@repo/models";

import { env } from "../env";

const _axios = axios.create({
  baseURL: `${env.NEXT_PUBLIC_API_URL}`,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export class API {
  createUser = async (data: { email: string }) => {
    try {
      await _axios.post<UserCreateOutputType>("/users", data);
    } catch (error) {
      throw error;
    }
  };

  getUser = async () => {
    try {
      const response = await _axios.get<UserGetOutputType>("/users");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  deleteUser = async () => {
    try {
      const response = await _axios.delete("/users");
      return response.data;
    } catch (error) {
      throw error;
    }
  };

  getSocketAuthToken = async () => {
    try {
      const response = await _axios.get<TokenRequest>("/socket/token");
      return response.data;
    } catch (error) {
      throw error;
    }
  };
}

export const api = new API();
