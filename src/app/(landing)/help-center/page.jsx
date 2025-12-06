import Link from "next/link";

import { Input } from "@/components/ui/input";
import Heading from "@/components/ui/heading";
import SubHeading from "@/components/ui/sub-heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Search,
  FileText,
  MessageCircle,
  Settings,
  HelpCircle,
  ArrowRight,
  Phone,
  Mail,
  MessageSquare,
  Plane,
} from "lucide-react";
// import { useRouter } from "next/navigation";
export default function LocalRules() {
  return (
    <div className="min-h-screen font-poppins pt-24">
      {/* <header className="bg-offWhite shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold font-bricolage text-absoluteDark">
            Local Rules and Regulation Policy
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">
            Last updated: June 1, 2024
          </p>
        </div>
      </header> */}

      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <header className=" mb-6">
              <Heading text="How can we help you?" />

              <SubHeading text="Find answers to your questions or contact our support team" />
            </header>
            <div className="bg-gradient-to-r bg-gray-100 border to-white rounded-lg p-8">
              <h2 className="text-2xl text-center font-semibold font-bricolage text-absoluteDark mb-6">
                Contact Us
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <MessageSquare className="h-8 w-8 text-stone mb-4" />
                      <h3 className="text-lg font-semibold text-absoluteDark mb-2">
                        Whatsapp Chat
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Start a conversation with our support team right now.
                      </p>
                      <Link
                        href="https://wa.me/918369995283"
                        target="_blank"
                        className="w-full bg-primaryGreen py-2 px-3 rounded-3xl text-sm hover:bg-brightGreen transition-colors text-white "
                      >
                        Chat on whatsapp
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Mail className="h-8 w-8 text-stone mb-4" />
                      <h3 className="text-lg font-semibold text-absoluteDark mb-2">
                        Email
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Send us an email and we&apos;ll get back to you within
                        24 hours.
                      </p>
                      <Link
                        href="mailto:support@majesticescape.com"
                        target="_blank"
                        className="w-full bg-primaryGreen py-2 px-3 rounded-3xl hover:bg-brightGreen transition-colors text-sm text-white"
                      >
                        support@majesticescape.com
                      </Link>
                    </div>
                  </CardContent>
                </Card>
                <Card className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center text-center">
                      <Phone className="h-8 w-8 text-stone mb-4" />
                      <h3 className="text-lg font-semibold text-absoluteDark mb-2">
                        Phone
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Call us directly for immediate assistance.
                      </p>
                      <Link
                        href="tel:918369995283"
                        target="_blank"
                        className="w-full bg-primaryGreen py-2 px-3 text-sm rounded-3xl hover:bg-brightGreen transition-colors text-white"
                      >
                        +91 7219666822
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            <div className="bg-white shadow overflow-hidden sm:rounded-lg mt-8">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-semibold text-primary">
                  Our Travelling Policy
                </h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-lg font-medium text-gray-500">
                      Safety
                    </dt>
                    <dd className="mt-1  text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="flex text-lg font-semibold">
                        Emergency procedures
                      </span>
                      <br />
                      <span className=" text-md font-semibold">
                        Contact info
                      </span>
                      <span className="flex">
                        {" "}
                        Indicate local emergency numbers and the nearest
                        hospital. Provide a clear emergency contact number for
                        yourself, as well as backup, for easy guest reference.
                        Also make clear how you should be contacted if the guest
                        has questions or issues arise.
                      </span>
                      <br />
                      <span className=" text-md font-semibold">Supplies </span>
                      <span className="flex">
                        {" "}
                        Make a first aid kit easily available.{" "}
                      </span>
                      <br />
                      <span className=" text-md font-semibold">
                        Fire prevention
                      </span>
                      <span className="flex">
                        {" "}
                        Ensure you have a functioning smoke alarm and carbon
                        monoxide detector, and that your property meets
                        government safety guidelines for your area (ex: National
                        Building Code or other local building bylaws). Ensure
                        you provide a functioning fire extinguisher and complete
                        required maintenance.{" "}
                      </span>
                      <br />
                      <span className=" text-md font-semibold">Exits</span>
                      <span className="flex">
                        {" "}
                        Ensure you have a clearly marked fire escape route, and
                        post a map in your home.
                      </span>
                      <br />
                      <span className="flex text-lg font-semibold">
                        Minimize hazards
                      </span>
                      <br />
                      <span className=" text-md font-semibold"> Privacy </span>
                      <span className="flex">
                        {" "}
                        Always be mindful of your guests' privacy. Fully
                        disclose whether there are security cameras or other
                        surveillance equipment at or around your listing. Make
                        sure you are aware of and comply with applicable
                        federal, state, and local laws.{" "}
                      </span>
                      <br />
                      <span className=" text-md font-semibold">Occupancy</span>
                      <span className="flex">
                        {" "}
                        Establish safe occupancy limits—your local government
                        may have guidelines.{" "}
                      </span>
                      <br />
                      <span className=" text-md font-semibold">Access</span>
                      <span className="flex">
                        Go through your home to identify any areas where guests
                        might trip or fall and either remove the hazard or mark
                        clearly. Fix any exposed wires. Ensure stairs are safe
                        and have railings. Remove or lock up any objects that
                        may be dangerous to your guests.{" "}
                      </span>
                      <br />
                      <span className=" text-md font-semibold">
                        {" "}
                        Child-proofing
                      </span>
                      <br />
                      <span className="flex">
                        {" "}
                        Ensure your home is safe for children, or else notify
                        guests of potential hazards.{" "}
                      </span>
                      <br />
                      <span className=" text-md font-semibold"> Climate</span>
                      <br />
                      <span className="flex">
                        {" "}
                        Ensure your home is properly ventilated and that
                        temperature control is clearly marked and functional.
                        Ensure guests are clear about how to safely use the
                        heater.
                      </span>
                      <br />
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-lg font-medium text-gray-500">
                      Neighbors
                    </dt>
                    <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="flex text-lg font-semibold">
                        Building Rules
                      </span>
                      <br />
                      {/* <span className="text-md font-semibold">
                        
                      </span> */}
                      <span className="flex">
                        {" "}
                        Ensure you relay your building's common area rules to
                        your guest. You may want to even notify your neighbors
                        that you will have guests, and remind guests not to
                        bother your neighbors (ex: don't knock on their door or
                        buzz them to let you in).
                      </span>
                      <br />
                      <span className="text-md font-semibold">Smoking</span>
                      <span className="flex">
                        {" "}
                        If you don't allow smoking, we suggest posting signs to
                        remind guests. If you do allow smoking, ensure you have
                        ashtrays available in designated areas.
                      </span>
                      <br />
                      <span className="text-md font-semibold">Parking</span>
                      <span className="flex">
                        {" "}
                        Ensure you relay parking rules for your building and
                        neighborhood to your guest.
                      </span>
                      <br />
                      <span className="text-md font-semibold">Noise</span>
                      <span className="flex">
                        {" "}
                        Remind guests about keeping noise down. You may want to
                        consider whether you allow babies, pets, or parties.
                        Develop a policy about guests inviting other people
                        over, and ensure your guests are clear about your "party
                        policy."
                      </span>
                      <br />
                      <span className="text-md font-semibold">Pets</span>
                      <span className="flex">
                        {" "}
                        If you allow pets, ensure guests are educated about
                        things like local parks and local customs (ex: cleaning
                        up after your dog). Have a backup plan in case a guest's
                        pet upsets the neighbors (such as the number of a nearby
                        pet hotel).
                      </span>
                      <br />
                      <span className="text-md font-semibold">House Rules</span>
                      <span className="flex">
                        {" "}
                        To avoid surprises, you may want to include the
                        information covered above in your House Rules in your
                        Majestic Escape listing profile.
                      </span>
                      <br />
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-lg font-lg text-gray-500">
                      Permissions
                    </dt>
                    <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="flex text-lg font-semibold">
                        Contracts
                      </span>
                      <br />
                      {/* <span className="text-md font-semibold">
                        
                      </span> */}
                      <span className="flex">
                        {" "}
                        Check your HOA or Co-Op Board regulations to make sure
                        there is no prohibition against subletting, or any other
                        restriction against hosting. Read your lease agreement
                        and check with your landlord if applicable. You may
                        consider adding a rider to your contract that addresses
                        the concerns of these parties and outlines the
                        responsibilities and liabilities of all parties.
                      </span>
                      <br />
                      <span className="text-md font-semibold">Roomates</span>
                      <span className="flex">
                        {" "}
                        If you have roommates, consider a roommate agreement in
                        writing which outlines things like how often you plan to
                        host, how you'll ensure guests follow House Rules, and
                        even whether you'll share revenue if that makes sense
                        for you.
                      </span>
                      <br />
                      <span className="text-md font-semibold">Neighbors</span>
                      <span className="flex">
                        {" "}
                        Consider whether you should notify your neighbors about
                        your plans to host, along with your plan for how to make
                        sure your guests are not disruptive.
                      </span>
                      <br />
                      <span className="text-md font-semibold">
                        Subsidized Housing
                      </span>
                      <span className="flex">
                        {" "}
                        If you live in public or subsidized housing there may be
                        special rules that apply to you. The manager of the
                        property may be able to answer questions about this.
                      </span>
                      <br />
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-lg font-medium text-gray-500">
                      General Regulations
                    </dt>
                    <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="flex text-lg font-semibold">Taxes</span>
                      <br />
                      {/* <span className="text-md font-semibold">
                        
                      </span> */}
                      <span className="flex">
                        {" "}
                        Ensure you look up any local taxes or business license
                        requirements that may apply. This may include things
                        like hotel/transient occupancy tax, sales, and other
                        turnover taxes such as Value Added Tax (VAT) or Goods
                        and Services Tax (GST), or income tax. Be sure to
                        provide your PAN to Majestic Escape so that the
                        appropriate withholding tax rate applies on your
                        earnings.
                      </span>
                      <br />

                      <span className="text-md font-semibold">
                        PAN Collection & Witholding Tax
                      </span>
                      <span className="flex">
                        {" "}
                        Majestic Escape is obligated to deduct a percentage of
                        the gross earnings of Hosts who are residents of India,
                        and remit these funds to the Indian tax authorities, per
                        section 194-O of the Indian Income-Tax Act.
                      </span>
                      <br />

                      <span className="text-md font-semibold">
                        Registration of guests
                      </span>
                      <span className="flex">
                        {" "}
                        Local regulations require maintaining a register for
                        guest check-in and check-out records, including passport
                        details for foreign tourists. Additionally, any Hotel /
                        Guest House / Dharamshala / Individual House /
                        University / Hospital / Institute that provides
                        accommodation to foreigners must submit the details of
                        the residing foreigner in Form C to the registration
                        authorities within 24 hours of the arrival of the
                        foreigner at the premises. The Form C can be submitted
                        online once the accommodation provider completes the
                        registration process. The regulations also require the
                        accommodation provider to complete and maintain the Form
                        B as a corresponding register.
                      </span>
                      <br />

                      <span className="text-md font-semibold">
                        Permits or registrations{" "}
                      </span>
                      <span className="flex">
                        {" "}
                        Ensure you look up any permitting, zoning, safety, and
                        health regulations that may apply. The governing
                        authorities that regulate the use and development of
                        property in your area may have useful information on
                        such regulations.
                      </span>
                      <br />
                      <span className="text-md font-semibold">
                        Rent control/rent stabilization
                      </span>
                      <span className="flex">
                        {" "}
                        If you live in rent controlled or stabilized housing,
                        there may be special rules that apply to you. Contact
                        your local rent board to ask questions about this topic.
                      </span>
                      <br />
                      <span className="flex text-lg font-semibold">
                        Contracts
                      </span>
                      <br />
                      {/* <span className="text-md font-semibold">
                        
                      </span> */}
                      <span className="flex">
                        {" "}
                        Check your HOA or Co-Op Board regulations to make sure
                        there is no prohibition against subletting, or any other
                        restriction against hosting. Read your lease agreement
                        and check with your landlord if applicable. You may
                        consider adding a rider to your contract that addresses
                        the concerns of these parties and outlines the
                        responsibilities and liabilities of all parties.
                      </span>
                      <br />
                      <span className="flex text-lg font-semibold">
                        Contracts
                      </span>
                      <br />
                      {/* <span className="text-md font-semibold">
                        
                      </span> */}
                      <span className="flex">
                        {" "}
                        Check your HOA or Co-Op Board regulations to make sure
                        there is no prohibition against subletting, or any other
                        restriction against hosting. Read your lease agreement
                        and check with your landlord if applicable. You may
                        consider adding a rider to your contract that addresses
                        the concerns of these parties and outlines the
                        responsibilities and liabilities of all parties.
                      </span>
                      <br />
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-lg font-medium text-gray-500">
                      Local Regulations
                    </dt>
                    <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                      <span className="flex">
                        {" "}
                        Select a location below to read city, county, or
                        region-specific info.
                      </span>
                      <br />
                      <div class="grid grid-cols-4 gap-4">
                        <Link href="/help-center/local-rules/goa">
                          <div className="underline">Goa</div>
                        </Link>{" "}
                        <Link href="/help-center/local-rules/karnataks">
                          {" "}
                          <div className="underline">Karnataka</div>
                        </Link>
                        <Link href="/help-center/local-rules/maharashtra">
                          <div className="underline">Maharashtra</div>{" "}
                        </Link>
                        <Link href="/help-center/local-rules/gujarat">
                          <div className="underline">Gujarat</div>
                        </Link>
                        <Link href="/help-center/goa">
                          <div className="underline">Delhi</div>
                        </Link>
                        <Link href="/help-center/goa">
                          {" "}
                          <div className="underline">Madhya Pradesh</div>
                        </Link>
                      </div>
                    </dd>
                  </div>
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-lg font-medium text-gray-500">
                      Insurance
                    </dt>
                    <dd className="mt-1 text-gray-900 sm:mt-0 sm:col-span-2">
                      {/* <span className="flex text-lg font-semibold">
                        Insurance
                      </span> */}
                      {/* <br /> */}
                      {/* <span className="text-md font-semibold">
                        
                      </span> */}
                      <span className="flex">
                        {" "}
                        Work with your insurance agent or carrier to determine
                        what kind of obligations, limits, and coverage are
                        required for your specific circumstances.
                      </span>
                      <br />
                      <span className="text-md font-semibold">
                        Liability and basic voverage
                      </span>
                      <span className="flex">
                        {" "}
                        Review your homeowner's or renter's policy with your
                        insurance agent or carrier to make sure your listing has
                        adequate liability coverage and property protection.
                      </span>
                      <br />
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-semibold text-primary">
                  Contact Us
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  If you have any questions about our Cancellation Policy,
                  please contact us.
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                    <dd className="mt-1 text-sm text-primary sm:mt-0 sm:col-span-2">
                      <a
                        className="underline"
                        href="mailto:support@majesticescape.in"
                      >
                        support@majesticescape.in
                      </a>
                    </dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
