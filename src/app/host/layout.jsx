"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Link from "next/link";
import { useEffect, useState } from "react";
// import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
// import { useCheckToken } from "@/services/useCheckToken";
const queryClient = new QueryClient();

const Layout = ({ children }) => {
  // const { checkToken } = useCheckToken();
  const [isAuth, setIsAuth] = useState(false);
  const [loading, setLoading] = useState(true);
  const auth = async () => {
    const getLocalData = await localStorage.getItem("token");
    const data = JSON.parse(getLocalData);
    if (data) {
      setIsAuth(true);
      setLoading(false);
    }
    // await checkToken();
  };

  // const auth = async () => {
  //   const saved = localStorage.getItem("token");
  //   if (!saved) {
  //     setIsAuth(false);
  //     setLoading(false);
  //     return;
  //   }

  //   const token = JSON.parse(saved);

  //   try {
  //     const res = await axios.get(
  //       `${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/validate-token`,
  //       {
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //         },
  //       }
  //     );

  //     // Token is valid
  //     setIsAuth(true);
  //   } catch (err) {
  //     console.log("Token invalid:", err?.response?.data);

  //     // Token invalid → remove and logout
  //     localStorage.removeItem("token");
  //     setIsAuth(false);
  //   }

  //   setLoading(false);
  // };
  useEffect(() => {
    auth();
  }, []);

  if (!isAuth) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center font-poppins pt-24">
          You are not authorized to access this page. &nbsp;{" "}
          <Link href="/login">
            <u>
              <b>Click Here</b>
            </u>
          </Link>
          &nbsp; to log in now to access.
        </div>
      </>
    );
  }
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="h-20 w-20 animate-spin rounded-full border-b-2 border-current"></div>
      </div>
    );
  }
  return (
    <>
      <QueryClientProvider client={queryClient}>
        <main className="font-poppins">{children}</main>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </>
  );
};

export default Layout;
