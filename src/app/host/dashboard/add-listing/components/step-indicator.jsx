// The indicator takes the free space between the header buttons and its
// segments shrink (32px max, 4px min), so long wizards no longer push
// "Help" / "Save & Exit" past the right edge at tablet widths.
export function StepIndicator({ currentStep, totalSteps }) {
  return (
    <div className="hidden md:flex flex-1 min-w-0 mx-4 items-center justify-center gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => (
        <div
          key={index}
          className={`h-1 flex-1 min-w-[4px] max-w-8 rounded-full ${
            index <= currentStep ? "bg-brightGreen" : "bg-gray-300"
          }`}
        />
      ))}
    </div>
  );
}
export function EditStepIndicator({ currentStep, totalSteps, onStepClick }) {
  return (
    <div className="hidden md:flex flex-1 min-w-0 mx-4 items-center justify-center gap-1">
      {Array.from({ length: totalSteps }).map((_, index) => {
        const isCompleted = index <= currentStep;

        return (
          <button
            key={index}
            type="button"
            onClick={() => onStepClick(index)}
            className={`
              h-1 flex-1 min-w-[4px] max-w-8 rounded-full transition-all
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
