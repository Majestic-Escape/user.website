import AccountLayout from "@/components/account-layout";
import AccountInfo from "@/components/account-info";

export const metadata = {
  robots: {
    index: false,
    follow: false,
  },
};
export default function AccountPage() {
  return (
    <AccountLayout>
      <AccountInfo />
    </AccountLayout>
  );
}
