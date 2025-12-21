import React from "react";

export default function SteelSwitch({ id, checked, onCheckedChange }) {
  return (
    <>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheckedChange(e.target.checked)}
        className="checkboxInput"
      />
      <label className="toggleSwitch" htmlFor={id}></label>
    </>
  );
}
