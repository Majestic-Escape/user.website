import { ArrowUp, Bell, MoreVertical } from "lucide-react";
import Image from "next/image";

export default function Component() {
  return (
    <section
      id="features"
      className="py-16 md:py-24 text-center bg-[#f6f6f6]  "
    >
      <div className="container px-4 md:px-6 mx-auto max-w-[1400px]">
        <div className="space-y-4 text-center mb-12">
          <h2 className="text-3xl font-bricolage font-bold  sm:text-4xl md:text-5xl">
            Elevate Your Hosting Experience
          </h2>
          <p className="mx-auto max-w-[600px] text-gray-500 md:text-lg/relaxed">
            A seamless suite of tools designed to transform property management
            into effortless success
          </p>
        </div>
        <div className="grid gap-6 md:gap-8 md:grid-cols-3">
          <div className="rounded-xl border bg-white border-[#bdbdbd]  p-6 shadow-sm relative">
            <div className="space-y-2 mb-6">
              <h3 className="font-bricolage text-center text-xl font-bold">
                <span className=" text-green-500">Zero</span> Commission,
                <br />
                for 90 days.
              </h3>
              <p className="text-center text-sm text-gray-500">
                Keep 100% of your earnings with our host-first approach
              </p>
            </div>
            <div className="space-y-3 mt-12 bg-[#ECFFE2] relative">
              {[35000, 26000, 38000].map((amount, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded-lg bg-white p-3 shadow-sm border "
                >
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-100">
                    <Bell className="h-4 w-4 text-green-600" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-900">
                      {amount} INR
                    </span>
                    <p className="text-xs text-gray-500">
                      has been credited to your account
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="absolute top-0 right-0 w-20 h-20 bg-green-100 rounded-bl-full"></div>
          </div>

          <div className="rounded-xl border bg-white border-[#BDBDBD] p-6 shadow-sm">
            <div className="space-y-2 mb-4">
              <h3 className="text-xl font-bricolage font-bold">
                Manage Multiple stays effortlessly
              </h3>
              <p className="text-sm text-gray-500">
                Bring harmony to team expenses with budget limits and real-time
                monitoring. Freedom for your staff. Peace of mind for you.
              </p>
            </div>
            <div className="rounded-xl mt-12  bg-[#ECFFE2] p-4">
              <div className="space-y-4">
                <div className="rounded-lg bg-white p-4 shadow-sm space-y-3">
                  {[
                    { name: "Rohan", message: "Previous stay was very..." },
                    { name: "Neil", message: "Glad your experience was..." },
                    { name: "Akriti", message: "Your Room service would..." },
                  ].map((user, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <Image
                        width={32}
                        height={32}
                        className="size-8"
                        src={`/images/avatar-${i + 1}.png`}
                        alt=""
                      />
                      <div className="flex-1 flex">
                        <div className="text-sm font-medium mr-3">
                          {user.name}
                        </div>
                        <div className="text-sm text-gray-500">
                          {user.message}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="rounded-lg bg-white p-4">
                  <div className="font-medium mb-3">Your Listed Properties</div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] text-gray-900">
                        Clove Heritage
                      </span>
                      <span className="rounded-full bg-black px-3 py-0.5 text-xs font-medium text-white">
                        Live
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[15px] text-gray-900">
                        Lazydaze Studio
                      </span>
                      <span className="rounded-full bg-[#DCFCE7] px-3 py-0.5 text-xs font-medium text-[#15803D]">
                        Booked
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="rounded-xl border text-center bg-white p-6 shadow-sm border-[#BDBDBD]">
            <div className="space-y-2 mb-4">
              <h3 className="text-xl font-bricolage font-bold">
                Reviews & Feedback
              </h3>
              <p className="text-sm  text-gray-500">
                Manage better with integrated guest feedback system
              </p>
            </div>
            <div className="flex mt-12 items-center justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 rounded-full bg-[#C2FFA1]" />
                <div className="absolute inset-6 rounded-full bg-[#ECFFE2]" />
                <div className="absolute inset-6 rounded-full  flex items-center justify-center">
                  <div className="text-center">
                    <div className="text-sm font-medium bg-blue-500 py-2   rounded-t-2xl rounded-br-2xl text-[#fff] translate-x-1/3">
                      It was a lovely stay!
                    </div>
                    <div className="mt-2 flex -space-x-1 justify-center">
                      <Image
                        width={48}
                        height={48}
                        className="size-10"
                        src="/images/avatar-1.png"
                        alt=""
                      />
                      <Image
                        width={48}
                        height={48}
                        className="size-10"
                        src="/images/avatar-2.png"
                        alt=""
                      />
                      <Image
                        width={48}
                        height={48}
                        className="size-10"
                        src="/images/avatar-3.png"
                        alt=""
                      />
                      <Image
                        width={48}
                        height={48}
                        className="size-10"
                        src="/images/avatar-4.png"
                        alt=""
                      />
                      <Image
                        width={48}
                        height={48}
                        className="size-10"
                        src="/images/avatar-5.png"
                        alt=""
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className=" gap-6 flex flex-col md:flex-row md:flex  mt-6 md:mt-8 ">
          <div className="rounded-xl border bg-white p-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-bricolage">
                Real-time accounting at your fingertips.
              </h3>
              <p className="text-sm text-gray-500">
                Take the pain out of book keeping! Wave goodbye to mountains of
                paperwork and endless email reminders. There&apos;s now a new
                way of accounting.
              </p>
            </div>
            <div className="mt-12 grid gap-4 lg:grid-cols-2">
              <div className="rounded-xl bg-[#ECFFE2] p-4">
                <div className="flex  gap-2 rounded-lg bg-white p-3 shadow-sm">
                  <span className="text-sm text-gray-600">
                    3+ new bookings. Check now
                  </span>
                  <span className="ml-auto">→</span>
                </div>
                <div className="mt-4 rounded-lg bg-white p-4">
                  <div className="text-2xl font-semibold">INR 1,73,000</div>
                  <div className="mt-2 space-y-2">
                    <div className="h-2 w-full rounded-full bg-[#C2FFA1]" />
                    <div className="h-2 w-full rounded-full bg-[#C2FFA1]" />
                    <div className="h-2 w-full rounded-full bg-[#C2FFA1]" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl bg-[#ECFFE2] p-4">
                <div className="space-y-2">
                  <div className="text-sm font-medium">
                    This week&apos;s Invoices
                  </div>
                  {["Satyendra-Jain", "Abhimanyu-Rana", "Rajat-Kumar"].map(
                    (name, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between rounded-lg bg-white p-3 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <Image
                            width={32}
                            height={32}
                            className="size-8"
                            src={`/images/avatar-${i + 1}.png`}
                            alt=""
                          />
                          <span className="text-sm">{name}-Invoice.pdf</span>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-xl border bg-white p-6">
            <div className="space-y-2">
              <h3 className="text-xl font-bold font-bricolage">
                Analytics & Reporting
              </h3>
              <p className="text-sm text-gray-500">
                Make informed decisions backed by data through our analytics
                tools.
              </p>
            </div>

            <div className=" space-y-4 relative h-full mb-6">
              <div className="rounded-lg border z-0 bg-white w-3/4 absolute left-0 top-0 shadow-2xl  p-4">
                <div className="flex justify-between gap-x-4">
                  <div className="flex items-start flex-col justify-start w-full">
                    <div className="text-sm font-medium text-left mb-6 text-gray-600">
                      Total customers
                    </div>
                    <div className="text-3xl text-left mb-2 font-medium">
                      2,420
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-sm text-green-500">
                      <span className="text-xs">40% vs last month</span>
                    </div>
                  </div>

                  <div className="flex-col justify-start items-end flex gap-y-8">
                    <MoreVertical className="h-4 w-4 text-gray-500" />

                    <Image
                      width={300}
                      height={300}
                      src="/images/customers-chart.svg"
                      alt=""
                    />
                  </div>
                </div>
              </div>
              <div className=" flex flex-col-reverse items-center gap-y-3 md:gap-y-0  md:flex-row md:items-end gap-x-8 md:justify-between justify-start "></div>
              <div className=" top-24 z-0 shadow-xl  bg-white absolute  right-0 w-2/3  rounded-lg border p-4">
                <div className="flex items-end justify-start flex-col">
                  <div className=" text-base mb-1 font-medium text-right text-absoluteDark">
                    User retention
                  </div>

                  <div className="flex gap-x-2 mb-3 items-center">
                    <span className="w-6 h-6 rounded-full flex justify-center items-center bg-absoluteDark">
                      <ArrowUp className="text-white size-4" />
                    </span>
                    <span className="text-sm font-light text-absoluteDark">
                      14.12%
                    </span>
                  </div>
                  <Image
                    width={300}
                    height={300}
                    alt="Chart line"
                    className="max-h-16 w-auto"
                    src={"/images/chart-line.svg"}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
