// "use client";
// import { useEffect, useState } from "react";

// type DeviceType = "mobile" | "tablet" | "desktop";

// export function useDeviceType(): DeviceType {
//   const [deviceType, setDeviceType] = useState<DeviceType>("desktop");

//   useEffect(() => {
//     const userAgent = navigator.userAgent.toLowerCase();

//     if (/mobile|iphone|ipod|android.*mobile|windows phone/.test(userAgent)) {
//       setDeviceType("mobile");
//     } else if (/ipad|tablet|android(?!.*mobile)/.test(userAgent)) {
//       setDeviceType("tablet");
//     } else {
//       setDeviceType("desktop");
//     }
//   }, []);

//   return deviceType;
// }
export function useDeviceType() {}
