export type ButtonVariant = 'primary' | 'secondary' | 'danger';
export type ButtonType = 'button' | 'submit' | 'reset';

export interface ButtonProps {
    children: React.ReactNode;
    variant?: ButtonVariant;
    type?: ButtonType;
    disabled?: boolean;
    loading?: boolean;
    loadingText?: string;
    onClick?: () => void;
    className?: string;
}
