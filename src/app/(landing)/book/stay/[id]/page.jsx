export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import BookStay from "./BookStay";

export default function BookLayout({ children }) {
  return <BookStay>{children}</BookStay>;
}
