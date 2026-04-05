import type { JSX } from "react";
import { Pills } from "@pbd/components/Pills";

type PageTitleProps = {
  title: string;
};

export const PageTitle = ({ title }: PageTitleProps): JSX.Element => (
  <div className="mb-6 flex items-center justify-between gap-4">
    <h1 className="text-xl font-bold text-foreground">{title}</h1>
    <Pills />
  </div>
);
