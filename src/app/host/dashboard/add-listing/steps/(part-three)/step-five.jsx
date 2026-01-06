import { useEffect, useState } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TextReveal } from "@/components/text-reveal";

const defaultHouseRules = [
  { id: "no_smoking", label: "No smoking" },
  { id: "no_parties", label: "No parties or events" },
  { id: "no_pets", label: "No pets" },
  { id: "quiet_hours", label: "Quiet hours from 10 PM to 7 AM" },
];

export function SetRules({ updateFormData, formData }) {
  const [selectedRules, setSelectedRules] = useState(
    formData?.selectedRules || []
  );
  const [customRules, setCustomRules] = useState(formData?.customRules || []);
  const [newRule, setNewRule] = useState("");
  if (process.env.NEXT_PUBLIC_ENV === "dev") {
    console.log("this is", formData);
  }

  useEffect(() => {
    updateFormData({ selectedRules, customRules });
  }, [selectedRules, customRules]);

  // const handleChange = () => {
  //   updateFormData({
  //     selectedRules,
  //     customRules,
  //   });
  // };

  const handleRuleChange = (ruleId) => {
    setSelectedRules((prev) =>
      prev.includes(ruleId)
        ? prev.filter((id) => id !== ruleId)
        : [...prev, ruleId]
    );
    // handleChange();
  };

  const addCustomRule = () => {
    if (newRule) {
      // setCustomRules((prev) => [...prev, newRule.trim()]);
      const updatedRules = [...customRules, newRule.trim()];
      setCustomRules(updatedRules);
      setNewRule("");
      // handleChange();
    }
  };

  const removeCustomRule = (index) => {
    setCustomRules((prev) => prev.filter((_, i) => i !== index));
    // handleChange();
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:space-y-8 md:max-w-3xl ">
      <TextReveal>
        <h3 className="text-xl md:text-2xl font-bricolage text-absoluteDark font-semibold">
          Let's set the stay rules
        </h3>
      </TextReveal>
      <TextReveal>
        <div className="pt-4 md:pt-0">
          <h3 className="text-base text-absoluteDark mb-2 font-medium font-bricolage">
            House Rules
          </h3>
          <div className="space-y-2">
            {defaultHouseRules.map((rule) => (
              <div
                key={rule.id}
                className="flex text-stone text-sm items-center space-x-2"
              >
                <Checkbox
                  id={rule.id}
                  checked={selectedRules.includes(rule.id)}
                  onCheckedChange={() => handleRuleChange(rule.id)}
                />
                <Label className="text-sm font-normal" htmlFor={rule.id}>
                  {rule.label}
                </Label>
              </div>
            ))}
            <div className="pt-6">
              <Label
                htmlFor="newRule"
                className="text-base text-absoluteDark font-bricolage mt-4 mb-2 "
              >
                Add custom rule
              </Label>
              <div className="flex flex-col  space-y-3 mt-1">
                <Textarea
                  id="newRule"
                  value={newRule}
                  className="text-sm"
                  onChange={(e) => setNewRule(e.target.value)}
                  maxLength={50}
                  placeholder="Enter a custom rule"
                />
                <div className="text-sm text-muted-foreground text-right">
                  (max. 50 characters) {newRule.length}/{50}
                </div>

                <Button
                  className="w-32 bg-primaryGreen hover:bg-brightGreen h-10"
                  onClick={addCustomRule}
                  type="button"
                >
                  Add
                </Button>
              </div>
            </div>
            {customRules.length > 0 && (
              <div className="space-y-2 mt-6">
                <h4 className="text-base font-bricolage text-absoluteDark font-medium">
                  Custom Rules:
                </h4>
                <ul className="list-disc list-inside">
                  {customRules.map((rule, index) => (
                    <li
                      key={index}
                      className="flex items-center justify-between"
                    >
                      <span className="text-sm text-stone font-normal mb-4">
                        {rule}
                      </span>
                      <button
                        onClick={() => removeCustomRule(index)}
                        className="bg-red-500 hover:bg-red-600 text-white text-sm py-1 px-2 rounded"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </TextReveal>
    </div>
  );
}
