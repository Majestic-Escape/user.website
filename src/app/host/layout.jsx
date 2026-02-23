export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import HostLayoutClient from "./HostLayoutClient";

export default function HostLayout({ children }) {
  return <HostLayoutClient>{children}</HostLayoutClient>;
}
