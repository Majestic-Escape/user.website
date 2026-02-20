export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import BookingList from "./BookingList";

export default function HostLayout({ children }) {
  return <BookingList>{children}</BookingList>;
}
