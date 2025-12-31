import { BankAccountForm } from "./bank-account-form";

export default function BankInfoPage() {
  return (
    <div className="container  py-6 px-4 sm:px-6 lg:px-8 mb-16">
      <div className="max-w-3xl ">
        <h1 className="text-2xl font-semibold text-gray-900 mb-2">
          Bank Account Information
        </h1>
        <p className="text-sm text-gray-600 mb-6">
          Please enter your bank account details to receive payments from
          Majestic Escape.
        </p>
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 sm:p-8">
            <h2 className="text-lg font-medium text-gray-900 mb-2">
              Secure Payment Setup
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              We take your financial security seriously and encrypt all
              sensitive information.
            </p>
            <BankAccountForm />
          </div>
        </div>
      </div>
    </div>
  );
}
