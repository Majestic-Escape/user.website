export function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="hidden md:flex items-center space-x-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-1 w-4 md:w-8 rounded-full ${
            index <= currentStep ? "bg-brightGreen" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
