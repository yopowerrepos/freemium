import * as React from "react";
import { Button, Popover, PopoverTrigger, PopoverSurface, Text } from "@fluentui/react-components";

export interface IHelpPopoverButtonProps {
    label: string;
    title: string;
    children: React.ReactNode;
}

export const HelpPopoverButton: React.FC<IHelpPopoverButtonProps> = ({ label, title, children }) => {
    return (
        <Popover withArrow>
            <PopoverTrigger disableButtonEnhancement>
                <Button size="small" appearance="subtle" aria-label={`Help: ${title}`}>
                    {`? ${label}`}
                </Button>
            </PopoverTrigger>
            <PopoverSurface style={{ maxWidth: "360px", display: "flex", flexDirection: "column", gap: "6px" }}>
                <Text weight="semibold">{title}</Text>
                {children}
            </PopoverSurface>
        </Popover>
    );
};
