import React, { FC } from "react";

interface NavButtonProps {
  title: string;
  isActive?: boolean;
  onClick?: () => void;
}

const NavButton: FC<NavButtonProps> = ({ title, isActive, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`${
        isActive && "bg-[#036756]"
      } text-white px-4 py-2 rounded hover:bg-[#036756] transition`}
    >
      {title}
    </button>
  );
};

export default NavButton;
