import Link, { type LinkProps } from "next/link";

interface Props extends LinkProps {
  children: React.ReactNode;
  className?: string;
  colorType?: 1 | 2;
}

export const NavLink = ({ children, colorType = 1, ...props }: Props) => {
  return (
    <Link
      {...props}
      className={`px-8 py-4 rounded-lg font-black shadow-lg ${
        colorType === 1
          ? "bg-amber-500 hover:bg-amber-400 shadow-amber-500/50"
          : "bg-cyan-500 hover:bg-cyan-400 shadow-cyan-500/50"
      }`}
    >
      {children}
    </Link>
  );
};
