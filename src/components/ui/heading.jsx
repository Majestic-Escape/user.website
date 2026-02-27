import React from "react";

const Heading = ({ text }) => {
  return (
    <h1 className="font-bricolage text-2xl mb-2 md:text-4xl font-semibold text-absoluteDark">
      {text}
    </h1>
  );
};

export default Heading;
