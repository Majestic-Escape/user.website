import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function PersonalInfo({ updateFormData, formData }) {
  const [personalInfo, setPersonalInfo] = useState(
    formData?.personalInfo || {
      fatherName: "",
      dob: "",
      address: {
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      },
    }
  );
  const today = new Date().toISOString().split("T")[0];
  const minDob = (() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().split("T")[0];
  })();

  useEffect(() => {
    // Prevent infinite loop by only updating when necessary
    const hasChanges =
      JSON.stringify(formData?.personalInfo) !== JSON.stringify(personalInfo);
    if (hasChanges) {
      updateFormData({ personalInfo });
    }
  }, [personalInfo, updateFormData, formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "fatherName") {
      const valid = /^[A-Za-z ]*$/.test(value);
      if (!valid) return;
    }

    if (name === "address.pincode") {
      const valid = /^[0-9]*$/.test(value);
      if (!valid) return;
      if (value.length > 6) return;
    }
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setPersonalInfo((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setPersonalInfo((prev) => ({ ...prev, [name]: value }));
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24">
      <h2 className="text-2xl font-semibold font-bricolage">
        Personal Information
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label
            className="font-bricolage text-base text-gray-700 font-semibold"
            htmlFor="fatherName"
          >
            Father's Name <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-10"
            id="fatherName"
            name="fatherName"
            value={personalInfo.fatherName}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label
            className="font-bricolage text-base text-gray-700 font-semibold"
            htmlFor="dob"
          >
            Your Date of Birth <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-10"
            id="dob"
            name="dob"
            type="date"
            value={personalInfo.dob}
            onChange={handleChange}
            max={minDob} // Block dates after <18 years
            min="1900-01-01"
            required
          />
        </div>
      </div>

      <div>
        <Label
          className="font-bricolage text-base text-gray-700 font-semibold"
          htmlFor="address.line1"
        >
          Address Line 1 <span className="text-red-500">*</span>
        </Label>
        <Input
          className="h-10"
          id="address.line1"
          name="address.line1"
          value={personalInfo.address.line1}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <Label
          className="font-bricolage text-base text-gray-700 font-semibold"
          htmlFor="address.line2"
        >
          Address Line 2 <span className="text-red-500">*</span>
        </Label>
        <Input
          className="h-10"
          id="address.line2"
          name="address.line2"
          value={personalInfo.address.line2}
          onChange={handleChange}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label
            className="font-bricolage text-base text-gray-700 font-semibold"
            htmlFor="address.city"
          >
            City <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-10"
            id="address.city"
            name="address.city"
            value={personalInfo.address.city}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label
            className="font-bricolage text-base text-gray-700 font-semibold"
            htmlFor="address.state"
          >
            State <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-10"
            id="address.state"
            name="address.state"
            value={personalInfo.address.state}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label
            className="font-bricolage text-base text-gray-700 font-semibold"
            htmlFor="address.pincode"
          >
            Pincode <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-10"
            id="address.pincode"
            name="address.pincode"
            value={personalInfo.address.pincode}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <Label
            className="font-bricolage text-base text-gray-700 font-semibold"
            htmlFor="address.country"
          >
            Country <span className="text-red-500">*</span>
          </Label>
          <Input
            className="h-10"
            id="address.country"
            name="address.country"
            value={personalInfo.address.country}
            onChange={handleChange}
            disabled
            required
          />
        </div>
      </div>
    </div>
  );
}
