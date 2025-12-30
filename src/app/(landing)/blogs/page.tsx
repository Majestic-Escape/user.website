import Image from "next/image";
import Link from "next/link";

import Heading from "@/components/ui/heading";
import SubHeading from "@/components/ui/sub-heading";

const blogPosts = [
  {
    id: 1,
    image: "/images/sada-fort-karnataka.png?height=220&width=320",
    category: "Stays",
    title: "Top 5 Reasons Why Homestays Are Better Than Hotels",
    date: "October 21, 2024",
  },
  {
    id: 2,
    image: "/images/img1.png?height=220&width=320",
    category: "Adventure",
    title: "How to Plan a Budget Trip Without Compromising Comfort",
    date: "October 20, 2024",
  },
  {
    id: 3,
    image: "/images/white_water_rafting.png?height=220&width=320",
    category: "Adventure",
    title: "How to Choose the Perfect Homestay for Your Family Trip",
    date: "October 19, 2024",
  },
  {
    id: 4,
    image: "/images/Fish-curry.jpg?height=220&width=320",
    category: "Food",
    title: "Spice of Life: A Culinary Journey Through Goan Cuisine",
    date: "October 18, 2024",
  },
];

export default function BlogPage() {
  return (
    <div className="min-h-screen py-32 bg-white font-poppins px-4 sm:px-6 lg:px-8 mx-auto">
      <div className="container max-w-7xl mx-auto px-4">
        <div className="mb-8 pt-8 md:pt-0">
          <Heading text={"Blogs"} />
          <SubHeading
            text={"Discover India's Hidden Treasures and Local Insights"}
          />
        </div>
        <div className="grid lg:grid-cols-2 lg:gap-y-16 gap-10">
          {blogPosts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.id}`}
              className="group block rounded-xl overflow-hidden focus:outline-none focus:bg-[#fafafa]"
            >
              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-5">
                <div className="shrink-0 relative rounded-xl overflow-hidden w-full sm:w-56 h-44">
                  <Image
                    width={320}
                    height={220}
                    className="group-hover:scale-105 group-focus:scale-105 transition-transform duration-500 ease-in-out size-full absolute top-0 start-0 object-cover rounded-xl"
                    src={post.image}
                    alt={`Cover image for ${post.title}`}
                  />
                </div>
                <div className="grow">
                  <span className="block text-sm font-medium text-blue-600 mb-1">
                    {post.category}
                  </span>
                  <h2 className="text-xl font-semibold text-gray-800 group-hover:text-gray-600 dark:text-neutral-300 dark:group-hover:text-white">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-sm text-gray-600 dark:text-neutral-400">
                    {post.date}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-x-1 text-sm text-blue-600 decoration-2 group-hover:underline font-medium dark:text-blue-500">
                    Read more
                    <svg
                      className="shrink-0 size-4"
                      xmlns="http://www.w3.org/2000/svg"
                      width={24}
                      height={24}
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={2}
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="m9 18 6-6-6-6" />
                    </svg>
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
