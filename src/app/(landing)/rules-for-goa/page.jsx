import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircleIcon } from "lucide-react"

export default function GoaRulesAndRegulations() {
  return (
    <div className="font-publicSans min-h-screen py-24 px-6">
      <header className="bg-offWhite shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-absoluteDark font-bricolage">Goa - Rules & Regulations</h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">Last updated: Jan 25, 2025</p>
        </div>
      </header>
      <main>
        <div className="max-w-7xl container mx-auto py-8">
          <Alert variant="destructive" className="mb-8">
            <AlertCircleIcon className="h-4 w-4" />
            <AlertTitle>Important Notice for Hosts</AlertTitle>
            <AlertDescription>
              We've gathered some information about hosting regulations in Goa. As a host, you are responsible for understanding and
              following all relevant laws and regulations for your property.
            </AlertDescription>
          </Alert>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Registration Requirements in Goa</CardTitle>
              <CardDescription>
                The Government of Goa has implemented regulations for the short-term rental of residential properties.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="mb-4">
                To legally operate your property in Goa, you must comply with these rules:
              </p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Register your property with the Department of Tourism, Government of Goa.</li>
                <li>Display the registration certificate prominently on the premises of your property.</li>
                <li>The registration is valid for five years from the date of issue.</li>
                <li>Submit renewal applications at least three months before the expiry of the registration.</li>
              </ul>
            </CardContent>
          </Card>

          <Accordion type="single" collapsible className="w-full space-y-4">
            <AccordionItem value="registration-process">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Registration Process
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">To register your property, follow these steps:</p>
                <ol className="list-decimal pl-6 space-y-2">
                  <li>Visit the official website of the Department of Tourism, Government of Goa.</li>
                  <li>Download and fill out the registration application form (Form A).</li>
                  <li>
                    Submit the completed form along with the required documents, which include:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Proof of ownership or lease agreement</li>
                      <li>NOC from the local panchayat or municipality</li>
                      <li>Character certificate issued by the local police station</li>
                      <li>Two passport-sized photographs</li>
                      <li>Fire safety certificate</li>
                      <li>Structural stability certificate</li>
                      <li>Sanitary certificate</li>
                      <li>Photographs of the property (exterior and interior)</li>
                    </ul>
                  </li>
                  <li>
                    Pay the prescribed registration fee:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>₹4,000 for properties with up to 5 rooms</li>
                      <li>₹8,000 for properties with 6 to 10 rooms</li>
                      <li>₹12,000 for properties with 11 to 15 rooms</li>
                      <li>₹16,000 for properties with 16 to 20 rooms</li>
                      <li>₹20,000 for properties with more than 20 rooms</li>
                    </ul>
                  </li>
                  <li>Await inspection by the tourism department officials.</li>
                  <li>Once approved, receive your registration certificate (Form B).</li>
                </ol>
                <p className="mt-4">
                  The entire process, from application to receiving the certificate, typically takes about 30 days.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="guest-information">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Guest Information Collection and Reporting
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  As a host listing your property on Majestic Escape, you are required to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Maintain a register of all guests, including their:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Full name</li>
                      <li>Nationality</li>
                      <li>Permanent address</li>
                      <li>Date of arrival</li>
                      <li>Date of departure</li>
                    </ul>
                  </li>
                  <li>For foreign guests, collect and record passport details.</li>
                  <li>
                    Submit this information to the local Foreigners Registration Office (FRO) or the nearest Police Station
                    within 24 hours of the guest's arrival.
                  </li>
                  <li>Keep this information confidential and use it only for official purposes.</li>
                  <li>Retain guest records for a minimum of one year.</li>
                </ul>
                <p className="mt-4">For foreign guests, you must also:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Fill out the C-Form, which includes detailed information about the foreign guest.</li>
                  <li>
                    Submit the C-Form online through the official government portal within 24 hours of the foreign guest's
                    arrival.
                  </li>
                  <li>Keep a copy of the submitted C-Form for your records.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="safety-standards">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Safety and Hygiene Standards
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Your property must maintain high standards of safety and hygiene:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Implement and maintain adequate fire safety measures:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Install smoke detectors and fire extinguishers</li>
                      <li>Clearly mark fire exits</li>
                      <li>Provide an evacuation plan</li>
                    </ul>
                  </li>
                  <li>
                    Ensure proper sanitation and cleanliness:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Regular cleaning and disinfection of all areas</li>
                      <li>Proper waste management</li>
                      <li>Clean and hygienic bathrooms</li>
                    </ul>
                  </li>
                  <li>Maintain first aid facilities on the premises.</li>
                  <li>Implement regular pest control measures.</li>
                  <li>Ensure proper ventilation and lighting in all rooms.</li>
                  <li>Conduct regular maintenance checks on all equipment and facilities.</li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="pricing-display">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Pricing and Information Display
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Display the rates for your property prominently at the reception or in each room.
                  </li>
                  <li>
                    Clearly communicate all charges to guests before booking, including:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Room rates</li>
                      <li>Service charges</li>
                      <li>Taxes</li>
                      <li>Any additional fees</li>
                    </ul>
                  </li>
                  <li>
                    Provide information about local attractions, transportation, and emergency contacts in each room or
                    common area.
                  </li>
                  <li>Display the registration certificate in a visible location.</li>
                  <li>
                    If offering any special services or amenities, ensure they are clearly listed and priced.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="signage">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Signage Requirements
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Your property must display the following signs prominently:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The registration certificate issued by the Department of Tourism.</li>
                  <li>A board displaying the name of the property and its registration number.</li>
                  <li>Rate chart for different types of accommodations and services offered.</li>
                  <li>Information about local tourist attractions and emergency contact numbers.</li>
                  <li>Any other signs or notices required by local authorities.</li>
                </ul>
                <p className="mt-4">
                  Ensure all signage is clearly visible and easily readable by guests.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="taxes">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Taxes and Financial Compliance
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">As a host in Goa, you are responsible for:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Collecting and remitting Goods and Services Tax (GST):
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>
                        Register for GST if your annual turnover exceeds the threshold (currently ₹20 lakhs)
                      </li>
                      <li>Collect GST from guests and file regular returns</li>
                    </ul>
                  </li>
                  <li>Paying income tax on your rental income.</li>
                  <li>Maintaining proper financial records of all transactions.</li>
                  <li>Issuing invoices or bills to guests for all charges.</li>
                  <li>
                    Complying with any local taxes or fees imposed by the Goa government on short-term rentals.
                  </li>
                </ul>
                <p className="mt-4">
                  It's recommended to consult with a local tax professional to ensure full compliance with all tax
                  regulations.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="cancellation-policy">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Cancellation and Refund Policy
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Your cancellation policy for your property should:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Be clearly communicated to guests at the time of booking.
                  </li>
                  <li>
                    Comply with local regulations and consumer protection laws.
                  </li>
                  <li>
                    Specify the conditions under which refunds will be provided.
                  </li>
                  <li>
                    Include information about any penalties or fees for cancellations.
                  </li>
                  <li>
                    Be fair and reasonable to both you and your guests.
                  </li>
                </ul>
                <p className="mt-4">
                  Consider offering flexible cancellation terms, especially in light of potential travel disruptions.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="local-laws">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Compliance with Local Laws and Community Guidelines
              </AccordionTrigger>
              <AccordionContent>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Respect and adhere to local community guidelines.</li>
                  <li>
                    Comply with noise regulations:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Inform guests about quiet hours</li>
                      <li>Take measures to minimize disturbances to neighbors</li>
                    </ul>
                  </li>
                  <li>
                    Ensure your property complies with zoning laws and any restrictions on short-term rentals in your
                    specific area of Goa.
                  </li>
                  <li>
                    Respect parking regulations and provide clear instructions to guests about parking options.
                  </li>
                  <li>
                    If offering food services, comply with food safety regulations.
                  </li>
                  <li>
                    Stay informed about any changes in local regulations that may affect your hosting activities.
                  </li>
                </ul>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="penalties">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Penalties for Non-Compliance
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">
                  Failure to comply with these regulations may result in severe penalties:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Operating without registration: Fine of ₹1 lakh for the first offense, increasing for subsequent
                    offenses.
                  </li>
                  <li>Non-renewal of registration: Fine of ₹25,000.</li>
                  <li>Failure to display rates: Fine of ₹10,000.</li>
                  <li>Failure to maintain hygiene and cleanliness: Fine of ₹10,000.</li>
                  <li>Violation of any other provision: Fine of ₹10,000.</li>
                  <li>Repeated violations may lead to cancellation of registration.</li>
                </ul>
                <p className="mt-4">
                  These penalties underscore the importance of strict adherence to all regulations.
                </p>
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="insurance">
              <AccordionTrigger className="font-bricolage font-medium text-absoluteDark text-lg">
                Insurance and Liability
              </AccordionTrigger>
              <AccordionContent>
                <p className="mb-4">To protect yourself and your property:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Obtain appropriate insurance coverage for your property, which may include:
                    <ul className="list-disc pl-6 mt-2 space-y-1">
                      <li>Property insurance</li>
                      <li>Liability insurance</li>
                      <li>Business interruption insurance</li>
                    </ul>
                  </li>
                  <li>Inform your insurance provider about your short-term rental activities.</li>
                  <li>
                    Consider additional coverage for high-value items or specific risks.
                  </li>
                  <li>
                    Regularly review and update your insurance policies.
                  </li>
                </ul>
                <p className="mt-4">
                  Consult with a local insurance agent to ensure you have adequate coverage for your specific situation.
                </p>
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg text-absoluteDark font-bricolage">Disclaimer</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                This information is provided for general guidance and may not be comprehensive or up to date. As a host listing your property on
                Majestic Escape, you are responsible for researching and complying with all applicable laws, regulations,
                and licensing requirements. For the most current and detailed information, please consult with the
                Department of Tourism, Government of Goa, or seek legal advice.
              </p>
              <p className="mt-4">
                Failure to comply with these regulations may result in fines, penalties, or the suspension or revocation of
                your registration to operate as a short-term rental in Goa.
              </p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
