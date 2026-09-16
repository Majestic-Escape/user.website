// /services/useCheckToken.js
"use client";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { clearSession } from "@/lib/session";

export function useCheckToken() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const checkToken = async () => {
    try {
      const token = JSON.parse(localStorage.getItem("token"));
      if (token) {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/check-token`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ token }),
          }
        );

        const result = await response.json();

        if (!response.ok) {
          if (result.code === "USER_BANNED") {
            // Server says the session is dead: drop auth keys + query cache
            // (device-local wishlist/filters are kept).
            clearSession(queryClient);

            router.push("/login");
            toast.error("Your account has been banned.");
          }
          // if (result.code === "TOKEN_INVALIDATED") {
          //   localStorage.clear();
          //   sessionStorage.clear();
          //   router.push("/login");
          //   toast.error("Session expired, please login again.");
          // }
          if (result.code === "TOKEN_EXPIRED") {
            clearSession(queryClient);
            router.push("/login");
            toast.error("Session expired, please login again.");
          }
          return null;
        }

        return result;
      }
    } catch (err) {
      console.error(err);
    }
  };

  return { checkToken };
}
