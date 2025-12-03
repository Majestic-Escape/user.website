import Link from "next/link";

export default function KarnatakaRules() {
  return (
    <div className="min-h-screen font-poppins pt-24">
      <header className="bg-offWhite shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-semibold font-bricolage text-absoluteDark">
            Local Karnataka Rules and Regulation Policy
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-stone">
            Last updated: June 1, 2024
          </p>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6">
                <h2 className="text-lg leading-6 font-semibold text-primary">
                  Karnataka Travel Policy
                </h2>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
                <dl className="sm:divide-y sm:divide-gray-200">
                  <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-lg font-medium text-gray-500">Rules</dt>
                    <dd className="mt-1  text-gray-900 sm:mt-0 sm:col-span-2">
                      <p>
                        When deciding whether to become an Majestic Escape host,
                        it's important for you to understand the laws in your
                        State. As a platform and marketplace we do not provide
                        legal advice, but we want to provide some useful links
                        that may help you better understand laws and regulations
                        in Karnataka. This list is not exhaustive, and should
                        not be considered legal advice, but it should give you a
                        good start in understanding your local laws. If you have
                        questions, contact the Karnataka Department of Tourism,
                        other Government agencies directly, or consult a local
                        lawyer or tax professional.{" "}
                      </p>
                      <br />
                      <p>For hosts operating a Homestay:</p>
                      <br />
                      <li>
                        <strong>Registration of Homestays.</strong> Homestays
                        operating in Karnataka are required to be registered
                        with the Karnataka Department of Tourism. If you are
                        listing a premises in which you or members of your
                        family are also staying, this would be considered a
                        homestay, and you should submit an application for
                        registration here. For guidance/help with registration,
                        you can refer to these instructions. In order to be
                        eligible for registration, your premises should meet the
                        requirements put in place by the Karnataka Department of
                        Tourism. Your premises should also not be registered as
                        a hotel or similar commercial establishment.
                      </li>
                      <br />
                      <li>
                        <strong>Display Name Board.</strong> After completing
                        registration, you should display a name board at the
                        entrance of the homestay, with the following words -
                        “Registered under the Tourism Department of Karnataka
                        Government”.
                      </li>
                      <br />
                      <li>
                        <strong>Maintain Books and Registers</strong>. While
                        operating your homestay in Karnataka, you should
                        maintain the following books and registers:
                        <br />
                        <li>A complaint/suggestion book;</li>
                        <li>
                          A registration book to record complete details of
                          guests;
                        </li>
                        <li>
                          A serially numbered bill book (three copies); and
                        </li>
                        <li>
                          A serially numbered payment/advance receipt book.
                        </li>
                      </li>
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
