import api from "./api";
import { type LoginRequest, type LoginResponse } from "../types/auth.types";

export const authService = {
  login: async (dto: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post("/auth/login", dto);
    return response.data;
  },

  logout: () => {
    localStorage.clear();
    window.location.href = "/login";
  },

  me: async () => {
    const response = await api.get("/auth/me");
    return response.data;
  },
};
