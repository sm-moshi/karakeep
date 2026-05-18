import React from "react";

type TabItemProps = React.HTMLAttributes<HTMLDivElement> & {
  value?: string;
};

export default function TabItem({
  children,
  value: _value,
  ...props
}: TabItemProps) {
  return <div {...props}>{children}</div>;
}
