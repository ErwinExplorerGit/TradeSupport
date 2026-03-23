export type InputType = 'text' | 'password' | 'email' | 'number' | 'search' | 'tel' | 'url';

export interface InputProps {
  id?: string;
  label?: string;
  type?: InputType;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  error?: string;
  hint?: string;
  autoComplete?: string;
  autoFocus?: boolean;
  className?: string;
  /** Slot for a trailing icon/button (e.g. show-password toggle) */
  suffix?: React.ReactNode;
}
