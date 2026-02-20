export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

import ProfileData from "./ProfileData";

export default function ProfileLayout({ children }) {
  return <ProfileData>{children}</ProfileData>;
}
