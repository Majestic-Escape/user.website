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
export function EditStepIndicator({ currentStep, totalSteps, onStepClick }) {
  return (
    <div className="hidden md:flex items-center space-x-1">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index <= currentStep;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onStepClick(index)}
            className={`
              h-1 w-4 md:w-8 rounded-full transition-all
              ${isCompleted ? "bg-brightGreen" : "bg-gray-300"}
              hover:opacity-80
              cursor-pointer
            `}
            aria-label={`Go to step ${index + 1}`}
          />
        );
      })}
    </div>
  );
}
