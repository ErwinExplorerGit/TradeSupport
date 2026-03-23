export interface DropdownOption {
    label: string;
    value: string;
}

export interface DropdownProps {
    label?: string;
    value: string;
    options: DropdownOption[];
    onChange: (value: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string;
}
