import Navbar from "@/components/host/navbar";

const Layout = ({ children }) => {
  return (
    <>
      <Navbar />
      <main className="font-publicSans">{children}</main>
    </>
  )
}

export default Layout