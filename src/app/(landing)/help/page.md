// import Link from "next/link";
// import { Input } from "@/components/ui/input";
// import Heading from "@/components/ui/heading";
// import SubHeading from "@/components/ui/sub-heading";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
// Search,
// FileText,
// MessageCircle,
// Settings,
// HelpCircle,
// ArrowRight,
// Phone,
// Mail,
// MessageSquare,
// Plane,
// } from "lucide-react";
// // import { useRouter } from "next/navigation";
// export default function HelpCenter() {
// // const router = useRouter();
// const categories = [
// {
// icon: <FileText className="h-6 w-6" />,
// title: "Booking & Reservations",
// description: "Learn about making, modifying, and canceling reservations",
// },
// {
// icon: <MessageCircle className="h-6 w-6" />,
// title: "Guest Services",
// description:
// "Information on amenities, special requests, and local attractions",
// },
// {
// icon: <Settings className="h-6 w-6" />,
// title: "Account Management",
// description: "Manage your profile, preferences, and payment methods",
// },
// {
// icon: <HelpCircle className="h-6 w-6" />,
// title: "General Inquiries",
// description: "Get answers to common questions about Majestic Escape",
// },
// ];
// const travel = {
// icon: <Plane className="h-6 w-6" />,
// title: "Travel Policy",
// description: "Click here to learn more about our local policies",
// };

// const popularQuestions = [
// { question: "How do I make a reservation?", link: "#" },
// { question: "What is your cancellation policy?", link: "#" },
// { question: "How can I modify my booking?", link: "#" },
// { question: "What amenities are included in my stay?", link: "#" },
// ];

// return (
// <div className="font-poppins min-h-screen py-32 bg-white">
// <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 ">
// <header className=" mb-6">
// <Heading text="How can we help you?" />

// <SubHeading text="Find answers to your questions or contact our support team" />
// </header>

// {/_ <div className="max-w-2xl mb-8">
// <div className="relative">
// <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
// <Input
// type="text"
// placeholder="Search for answers..."
// className="w-full pl-10 pr-4 py-2 rounded-md border-gray-200 focus:border-gray-300 focus:ring-0 transition-colors text-base"
// />
// </div>
// </div> _/}

// <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-16">
// {categories.map((category, index) => (
// <Card
// key={index}
// className="border-0 shadow-sm "
// //hover:shadow-md transition-shadow"
// >
// <CardHeader>
// <div className="flex items-center space-x-4">
// <div className="rounded-full bg-gray-100 p-3">
// {category.icon}
// </div>
// <div>
// <CardTitle className="text-lg font-semibold text-gray-900">
// {category.title}
// </CardTitle>
// <p className="text-sm text-gray-500 mt-1">
// {category.description}
// </p>
// </div>
// </div>
// </CardHeader>
// </Card>
// ))}
// </div>
// <div className="mb-16">
// <h2 className="text-2xl font-semibold font-bricolage text-absoluteDark mb-6">
// Policy
// </h2>
// <Link
// href="/local-rules"
// // target="\_blank"
// // className="w-full bg-primaryGreen py-2 px-3 rounded-3xl text-sm hover:bg-brightGreen transition-colors text-white "
// >
// <Card
// key={"travel"}
// // onClick={() => router.push("/local-rules")}
// className="border-0 shadow-sm hover:shadow-md transition-shadow"
// >
// <CardHeader>
// <div className="flex items-center space-x-4">
// <div className="rounded-full bg-gray-100 p-3">
// {travel.icon}
// </div>
// <div>
// <CardTitle className="text-lg font-semibold text-gray-900">
// {travel.title}
// </CardTitle>
// <p className="text-sm text-gray-500 mt-1">
// {travel.description}
// </p>
// </div>
// </div>
// </CardHeader>
// </Card>
// </Link>
// </div>
// <div className="mb-16">
// <h2 className="text-2xl font-semibold font-bricolage text-absoluteDark mb-6">
// Popular Questions
// </h2>
// <div className="grid md:grid-cols-2 gap-4">
// {popularQuestions.map((item, index) => (
// <Link
// key={index}
// href={item.link}
// className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
// >
// <span className="text-gray-700">{item.question}</span>
// <ArrowRight className="h-4 w-4 text-gray-400" />
// </Link>
// ))}
// </div>
// </div>

// <div className="bg-gradient-to-r bg-gray-100 border to-white rounded-lg p-8">
// <h2 className="text-2xl text-center font-semibold font-bricolage text-absoluteDark mb-6">
// Contact Us
// </h2>
// <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
// <Card className="border-0 shadow-sm">
// <CardContent className="p-6">
// <div className="flex flex-col items-center text-center">
// <MessageSquare className="h-8 w-8 text-stone mb-4" />
// <h3 className="text-lg font-semibold text-absoluteDark mb-2">
// Whatsapp Chat
// </h3>
// <p className="text-gray-600 mb-4">
// Start a conversation with our support team right now.
// </p>
// <Link
// href="https://wa.me/918369995283"
// target="\_blank"
// className="w-full bg-primaryGreen py-2 px-3 rounded-3xl text-sm hover:bg-brightGreen transition-colors text-white "
// >
// Chat on whatsapp
// </Link>
// </div>
// </CardContent>
// </Card>
// <Card className="border-0 shadow-sm">
// <CardContent className="p-6">
// <div className="flex flex-col items-center text-center">
// <Mail className="h-8 w-8 text-stone mb-4" />
// <h3 className="text-lg font-semibold text-absoluteDark mb-2">
// Email
// </h3>
// <p className="text-gray-600 mb-4">
// Send us an email and we&apos;ll get back to you within 24
// hours.
// </p>
// <Link
// href="mailto:support@majesticescape.com"
// target="\_blank"
// className="w-full bg-primaryGreen py-2 px-3 rounded-3xl hover:bg-brightGreen transition-colors text-sm text-white"
// >
// support@majesticescape.com
// </Link>
// </div>
// </CardContent>
// </Card>
// <Card className="border-0 shadow-sm">
// <CardContent className="p-6">
// <div className="flex flex-col items-center text-center">
// <Phone className="h-8 w-8 text-stone mb-4" />
// <h3 className="text-lg font-semibold text-absoluteDark mb-2">
// Phone
// </h3>
// <p className="text-gray-600 mb-4">
// Call us directly for immediate assistance.
// </p>
// <Link
// href="tel:918369995283"
// target="\_blank"
// className="w-full bg-primaryGreen py-2 px-3 text-sm rounded-3xl hover:bg-brightGreen transition-colors text-white"
// >
// +91 83699 95283
// </Link>
// </div>
// </CardContent>
// </Card>
// </div>
// </div>
// </div>
// </div>
// );
// }
