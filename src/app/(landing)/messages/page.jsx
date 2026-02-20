export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import Messaging from "./Messaging";

export default function MessageLayout({ children }) {
  return <Messaging>{children}</Messaging>;
}
