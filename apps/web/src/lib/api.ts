import { type TokenRequest } from "ably";
import axios from "axios";

import {
  type PullRequest,
  type PushRequest,
  type UserCreateOutputType,
  type UserGetOutputType,
} from "@repo/models";

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
    await _axios.post<UserCreateOutputType>("/users", data);
  };

  getUser = async () => {
    const response = await _axios.get<UserGetOutputType>("/users");
    return response.data;
  };

  deleteUser = async () => {
    const response = await _axios.delete("/users");
    return response.data;
  };

  getSocketAuthToken = async () => {
    const response = await _axios.get<TokenRequest>("/socket/token");
    return response.data;
  };

  replicachePull = async (data: PullRequest, instanceId: string) => {
    const response = await _axios.post(`/replicache/pull?instance=${instanceId}`, data);
    return response;
  };

  replicachePush = async (data: PushRequest, instanceId: string) => {
    const response = await _axios.post(`/replicache/push?instance=${instanceId}`, data);
    return response;
  };
}

export const api = new API();
